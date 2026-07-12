const express = require('express');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');
const router = express.Router();
//Done
// @desc    Get dashboard KPIs
// @route   GET /api/reports/kpis
// @access  Private
router.get('/kpis', protect, async (req, res) => {
    try {
        const { type, region } = req.query;
        const userRole = req.user.role;

        // Safety Officer KPIs
        if (userRole === 'Safety Officer') {
            const totalDrivers = await Driver.countDocuments();
            const availableDrivers = await Driver.countDocuments({ status: 'Available' });
            const driversOnTrip = await Driver.countDocuments({ status: 'On Trip' });
            const suspendedDrivers = await Driver.countDocuments({ status: 'Suspended' });

            // Count expired licenses
            const expiredLicenses = await Driver.countDocuments({
                licenseExpiryDate: { $lt: new Date() }
            });

            // Calculate average safety score
            const drivers = await Driver.find();
            const averageSafetyScore = drivers.length > 0
                ? drivers.reduce((sum, d) => sum + (d.safetyScore || 0), 0) / drivers.length
                : 0;

            const vehicles = await Vehicle.find();
            let activeVehicles = 0;
            let availableVehicles = 0;
            let inShopVehicles = 0;

            vehicles.forEach(v => {
                if (v.status === 'On Trip') activeVehicles++;
                else if (v.status === 'Available') availableVehicles++;
                else if (v.status === 'In Shop') inShopVehicles++;
            });

            const activeTrips = await Trip.countDocuments({ status: 'Dispatched' });
            const pendingTrips = await Trip.countDocuments({ status: 'Draft' });
            const driversOnDuty = await Driver.countDocuments({
                status: { $in: ['Available', 'On Trip'] }
            });

            const totalActiveVehicles = activeVehicles + availableVehicles + inShopVehicles;
            const fleetUtilization = totalActiveVehicles > 0
                ? Math.round((activeVehicles / totalActiveVehicles) * 100)
                : 0;

            return res.json({
                totalDrivers,
                availableDrivers,
                driversOnTrip,
                expiredLicenses,
                suspendedDrivers,
                averageSafetyScore,
                activeVehicles,
                availableVehicles,
                inShopVehicles,
                activeTrips,
                pendingTrips,
                driversOnDuty,
                fleetUtilization
            });
        }
        
        // Financial Analyst KPIs
        if (userRole === 'Financial Analyst') {
            const vehicles = await Vehicle.find({ status: { $ne: 'Retired' } });
            let totalFuelCost = 0;
            let maintenanceCost = 0;
            let operationalCost = 0;
            let totalExpenses = 0;
            let totalRevenue = 0;
            let totalDistance = 0;
            let totalFuelConsumed = 0;
            let roiSum = 0;
            let roiCount = 0;

            for (const vehicle of vehicles) {
                const expenses = await Expense.find({ vehicle: vehicle._id });
                let vehicleFuel = 0;
                let vehicleMaint = 0;
                let vehicleOther = 0;
                let vehicleLiters = 0;

                expenses.forEach(exp => {
                    if (exp.category === 'Fuel') {
                        vehicleFuel += exp.cost;
                        if (exp.liters) vehicleLiters += exp.liters;
                    } else if (exp.category === 'Maintenance') {
                        vehicleMaint += exp.cost;
                    } else {
                        vehicleOther += exp.cost;
                    }
                });

                const vehicleTotalExpenses = vehicleFuel + vehicleMaint + vehicleOther;
                totalFuelCost += vehicleFuel;
                maintenanceCost += vehicleMaint;
                operationalCost += vehicleOther;
                totalExpenses += vehicleTotalExpenses;

                const completedTrips = await Trip.find({
                    vehicle: vehicle._id,
                    status: 'Completed'
                });

                let vehicleRevenue = 0;
                let vehicleDistance = 0;
                let vehicleTripFuel = 0;

                completedTrips.forEach(trip => {
                    vehicleRevenue += trip.revenue || 0;
                    vehicleDistance += trip.distance || 0;
                    if (trip.fuelConsumed) vehicleTripFuel += trip.fuelConsumed;
                });

                totalRevenue += vehicleRevenue;
                totalDistance += vehicleDistance;
                totalFuelConsumed += (vehicleTripFuel || vehicleLiters);

                const roiNumerator = vehicleRevenue - vehicleTotalExpenses;
                const roi = vehicle.acquisitionCost > 0
                    ? roiNumerator / vehicle.acquisitionCost
                    : 0;

                roiSum += roi;
                roiCount++;
            }

            const averageVehicleRoi = roiCount > 0 ? (roiSum / roiCount) : 0;
            const globalFuelEfficiency = totalFuelConsumed > 0 ? (totalDistance / totalFuelConsumed) : 0;

            return res.json({
                totalFuelCost,
                operationalCost,
                maintenanceCost,
                vehicleRoi: averageVehicleRoi,
                fuelEfficiency: globalFuelEfficiency,
                totalExpenses,
                totalRevenue
            });
        }

        // Fleet Manager / Default KPIs
        let vehicleQuery = {};
        if (type) vehicleQuery.type = type;

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
            fleetUtilization: utilization,
            totalDrivers: 0,
            availableDrivers: 0,
            driversOnTrip: 0,
            expiredLicenses: 0,
            suspendedDrivers: 0,
            averageSafetyScore: 0
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
