const express = require('express');
const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Expense = require('../models/Expense');
const { protect, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

// Helper to check driver compliance
const validateDriverForDispatch = (driver) => {
    if (driver.status === 'Suspended') {
        return 'Driver is suspended and cannot be dispatched.';
    }
    if (driver.status === 'On Trip') {
        return 'Driver is already on another active trip.';
    }
    if (driver.status === 'Off Duty') {
        return 'Driver is off duty.';
    }
    const expiry = new Date(driver.licenseExpiryDate);
    const now = new Date();
    if (expiry < now) {
        return `Driver's license is expired (Expiry: ${expiry.toLocaleDateString()}).`;
    }
    return null;
};

// Helper to check vehicle compliance
const validateVehicleForDispatch = (vehicle, cargoWeight) => {
    if (vehicle.status === 'Retired') {
        return 'Vehicle is retired.';
    }
    if (vehicle.status === 'In Shop') {
        return 'Vehicle is in maintenance/shop.';
    }
    if (vehicle.status === 'On Trip') {
        return 'Vehicle is already on another active trip.';
    }
    if (cargoWeight > vehicle.maxCapacity) {
        return `Cargo weight (${cargoWeight} kg) exceeds vehicle's maximum capacity (${vehicle.maxCapacity} kg).`;
    }
    return null;
};

// @desc    Get all trips
// @route   GET /api/trips
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const trips = await Trip.find()
            .populate('vehicle')
            .populate('driver')
            .sort({ createdAt: -1 });
        res.json(trips);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id)
            .populate('vehicle')
            .populate('driver');
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        res.json(trip);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a new trip (Draft or Dispatched)
// @route   POST /api/trips
// @access  Private (Fleet Manager or Driver/Dispatcher)
router.post('/', protect, async (req, res) => {
    const { source, destination, vehicle: vehicleId, driver: driverId, cargoWeight, distance, revenue, status } = req.body;

    try {
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        // Capacity check is mandatory regardless of Draft or Dispatched
        if (cargoWeight > vehicle.maxCapacity) {
            return res.status(400).json({
                message: `Cargo weight (${cargoWeight} kg) exceeds the vehicle's maximum capacity (${vehicle.maxCapacity} kg).`
            });
        }

        const targetStatus = status || 'Draft';

        if (targetStatus === 'Dispatched') {
            const vehicleErr = validateVehicleForDispatch(vehicle, cargoWeight);
            if (vehicleErr) return res.status(400).json({ message: vehicleErr });

            const driverErr = validateDriverForDispatch(driver);
            if (driverErr) return res.status(400).json({ message: driverErr });

            // Change vehicle & driver status
            vehicle.status = 'On Trip';
            driver.status = 'On Trip';
            await vehicle.save();
            await driver.save();
        }

        const trip = await Trip.create({
            source,
            destination,
            vehicle: vehicleId,
            driver: driverId,
            cargoWeight,
            distance,
            revenue: revenue || 0,
            status: targetStatus
        });

        res.status(201).json(trip);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Dispatch an existing Draft trip
// @route   POST /api/trips/:id/dispatch
// @access  Private
router.post('/:id/dispatch', protect, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (trip.status !== 'Draft') {
            return res.status(400).json({ message: `Cannot dispatch a trip that is already ${trip.status}` });
        }

        const vehicle = await Vehicle.findById(trip.vehicle);
        const driver = await Driver.findById(trip.driver);

        const vehicleErr = validateVehicleForDispatch(vehicle, trip.cargoWeight);
        if (vehicleErr) return res.status(400).json({ message: vehicleErr });

        const driverErr = validateDriverForDispatch(driver);
        if (driverErr) return res.status(400).json({ message: driverErr });

        // Transition statuses
        vehicle.status = 'On Trip';
        driver.status = 'On Trip';
        await vehicle.save();
        await driver.save();

        trip.status = 'Dispatched';
        await trip.save();

        res.json(trip);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Complete a trip
// @route   POST /api/trips/:id/complete
// @access  Private
router.post('/:id/complete', protect, async (req, res) => {
    const { finalOdometer, fuelConsumed, fuelCost } = req.body;

    if (finalOdometer === undefined || finalOdometer === null) {
        return res.status(400).json({ message: 'Final odometer value is required to complete the trip.' });
    }

    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found.' });
        }

        if (trip.status !== 'Dispatched') {
            return res.status(400).json({ message: `Only dispatched trips can be completed. Current status: ${trip.status}` });
        }

        const vehicle = await Vehicle.findById(trip.vehicle);
        const driver = await Driver.findById(trip.driver);

        if (finalOdometer < vehicle.odometer) {
            return res.status(400).json({
                message: `Final odometer (${finalOdometer} km) cannot be less than vehicle's current odometer (${vehicle.odometer} km).`
            });
        }

        // 1. Update vehicle odometer & status
        vehicle.odometer = finalOdometer;
        vehicle.status = 'Available';
        await vehicle.save();

        // 2. Update driver status
        if (driver) {
            driver.status = 'Available';
            await driver.save();
        }

        // 3. Update Trip details
        trip.status = 'Completed';
        trip.finalOdometer = finalOdometer;
        trip.completedAt = new Date();
        if (fuelConsumed) {
            trip.fuelConsumed = fuelConsumed;
        }
        await trip.save();

        // 4. Log fuel log/expense if custom values entered
        if (fuelConsumed && fuelCost) {
            await Expense.create({
                vehicle: vehicle._id,
                category: 'Fuel',
                cost: fuelCost,
                liters: fuelConsumed,
                date: new Date(),
                description: `Fuel consumption logged on completing Trip to ${trip.destination}`
            });
        }

        res.json(trip);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Cancel a trip
// @route   POST /api/trips/:id/cancel
// @access  Private
router.post('/:id/cancel', protect, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found.' });
        }

        if (trip.status === 'Completed' || trip.status === 'Cancelled') {
            return res.status(400).json({ message: `Cannot cancel a trip that is already ${trip.status}` });
        }

        const vehicle = await Vehicle.findById(trip.vehicle);
        const driver = await Driver.findById(trip.driver);

        // If dispatched, we restore driver and vehicle to Available
        if (trip.status === 'Dispatched') {
            if (vehicle && vehicle.status === 'On Trip') {
                vehicle.status = 'Available';
                await vehicle.save();
            }
            if (driver && driver.status === 'On Trip') {
                driver.status = 'Available';
                await driver.save();
            }
        }

        trip.status = 'Cancelled';
        await trip.save();

        res.json(trip);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
