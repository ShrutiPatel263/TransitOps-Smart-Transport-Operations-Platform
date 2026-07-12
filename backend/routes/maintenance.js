const express = require('express');
const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');
const Expense = require('../models/Expense');
const { protect, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

// @desc    Get all maintenance logs
// @route   GET /api/maintenance
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const logs = await Maintenance.find().populate('vehicle').sort({ createdAt: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create an active maintenance record
// @route   POST /api/maintenance
// @access  Private (Fleet Manager only)
router.post('/', protect, authorizeRoles('Fleet Manager'), async (req, res) => {
    const { vehicle: vehicleId, description, startDate } = req.body;

    try {
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found.' });
        }

        if (vehicle.status === 'Retired') {
            return res.status(400).json({ message: 'Cannot place a retired vehicle in maintenance.' });
        }

        if (vehicle.status === 'On Trip') {
            return res.status(400).json({ message: 'Vehicle is currently on a trip. Complete or cancel the trip first.' });
        }

        // Create the maintenance record
        const log = await Maintenance.create({
            vehicle: vehicleId,
            description,
            startDate: startDate || new Date(),
            status: 'Active'
        });

        // Mark vehicle status as In Shop
        vehicle.status = 'In Shop';
        await vehicle.save();

        res.status(201).json(log);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Close maintenance and restore vehicle status
// @route   POST /api/maintenance/:id/close
// @access  Private (Fleet Manager only)
router.post('/:id/close', protect, authorizeRoles('Fleet Manager'), async (req, res) => {
    const { cost, endDate } = req.body;

    if (cost === undefined || cost === null) {
        return res.status(400).json({ message: 'Closing maintenance requires specifying the cost.' });
    }

    try {
        const log = await Maintenance.findById(req.params.id);
        if (!log) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }

        if (log.status === 'Closed') {
            return res.status(400).json({ message: 'Maintenance record is already closed.' });
        }

        const vehicle = await Vehicle.findById(log.vehicle);

        // Close the log
        log.status = 'Closed';
        log.cost = cost;
        log.endDate = endDate || new Date();
        await log.save();

        // Restores vehicle to Available (unless retired)
        if (vehicle && vehicle.status !== 'Retired') {
            vehicle.status = 'Available';
            await vehicle.save();
        }

        // Automatically create a Maintenance expense log
        await Expense.create({
            vehicle: log.vehicle,
            category: 'Maintenance',
            cost: cost,
            date: log.endDate,
            description: `Maintenance completed: ${log.description}`
        });

        res.json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
