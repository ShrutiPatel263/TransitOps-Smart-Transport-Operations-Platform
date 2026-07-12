const express = require('express');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');
const router = express.Router();

// @desc    Get dashboard KPIs
// @route   GET /api/reports/kpis
// @access  Private
router.get('/kpis', protect, async (req, res) => {
    try {
        const { type, region } = req.query; // If filters are passed (simple stub or match)
        let vehicleQuery = {};
        if (type) vehicleQuery.type = type;
        // region could be matched online if added to schemas. We support it by matching model or just simple filters.

        const vehicles = await Vehicle.find(vehicleQuery);

        let activeVehicles = 0;
        let availableVehicles = 0;
        let inShopVehicles = 0;
        let retiredVehicles = 0;

        vehicles.forEach(v => {
            if (v.status === 'On Trip') activeVehicles++;
            else if (v.status === 'Available') availableVehicles++;
            else if (v.status === 'In Shop') inShopVehicles++;
            else if (v.status === 'Retired') retiredVehicles++;
        });

        const activeTrips = await Trip.countDocuments({ status: 'Dispatched' });
        const pendingTrips = await Trip.countDocuments({ status: 'Draft' });

        // Drivers on duty
        const driversOnDuty = await Driver.countDocuments({
            status: { $in: ['Available', 'On Trip'] }
        });

        // Fleet utilization %
        // Formula: (Active / Total Non-Retired) * 100
        const totalActiveVehicles = activeVehicles + availableVehicles + inShopVehicles;
        const utilization = totalActiveVehicles > 0
            ? Math.round((activeVehicles / totalActiveVehicles) * 100)
            : 0;

        res.json({
            activeVehicles,
            availableVehicles,
            inShopVehicles,
            retiredVehicles,
            activeTrips,
            pendingTrips,
            driversOnDuty,
            fleetUtilization: utilization
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get vehicle performance & financial reports (ROI, Fuel Efficiency, Operational Cost)
// @route   GET /api/reports/fleet
// @access  Private
router.get('/fleet', protect, async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ status: { $ne: 'Retired' } });

        const reportData = await Promise.all(vehicles.map(async (vehicle) => {
            // 1. Gather all maintenance and fuel expenses
            const expenses = await Expense.find({ vehicle: vehicle._id });
            let fuelCost = 0;
            let maintenanceCost = 0;
            let otherExpenses = 0;
            let totalLiters = 0;

            expenses.forEach(exp => {
                if (exp.category === 'Fuel') {
                    fuelCost += exp.cost;
                    if (exp.liters) totalLiters += exp.liters;
                } else if (exp.category === 'Maintenance') {
                    maintenanceCost += exp.cost;
                } else {
                    otherExpenses += exp.cost;
                }
            });

            const totalOpCost = fuelCost + maintenanceCost + otherExpenses;

            // 2. Gather completed trips to compute total revenue and total distance travelled
            const completedTrips = await Trip.find({
                vehicle: vehicle._id,
                status: 'Completed'
            });

            let totalRevenue = 0;
            let totalDistance = 0;
            let tripFuelConsumed = 0;

            completedTrips.forEach(trip => {
                totalRevenue += trip.revenue || 0;
                totalDistance += trip.distance || 0;
                if (trip.fuelConsumed) tripFuelConsumed += trip.fuelConsumed;
            });

            // 3. Compute Fuel Efficiency (Distance / Fuel liters)
            // We can use the total liters from fuel logs or trip logs. Let's prioritize trip-logged fuel, then fuel logs.
            const fuelForEfficiency = tripFuelConsumed || totalLiters;
            const fuelEfficiency = fuelForEfficiency > 0
                ? parseFloat((totalDistance / fuelForEfficiency).toFixed(2))
                : 0;

            // 4. Compute ROI: (Revenue - (Maintenance + Fuel + otherExpenses)) / AcquisitionCost
            const roiNumerator = totalRevenue - totalOpCost;
            const roi = vehicle.acquisitionCost > 0
                ? parseFloat((roiNumerator / vehicle.acquisitionCost).toFixed(4))
                : 0;

            return {
                vehicleId: vehicle._id,
                registrationNumber: vehicle.registrationNumber,
                model: vehicle.model,
                type: vehicle.type,
                acquisitionCost: vehicle.acquisitionCost,
                odometer: vehicle.odometer,
                status: vehicle.status,
                fuelCost,
                maintenanceCost,
                otherExpenses,
                totalOperationalCost: totalOpCost,
                totalRevenue,
                totalDistance,
                fuelEfficiency, // km per liter
                roi // ratio, e.g., 0.12 = 12%
            };
        }));

        res.json(reportData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
