const express = require('express');
const Vehicle = require('../models/Vehicle');
const { protect, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

// @desc    Get all vehicles (with filters)
// @route   GET /api/vehicles
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { status, type, search } = req.query;
        let query = {};

        if (status) query.status = status;
        if (type) query.type = type;
        if (search) {
            query.$or = [
                { registrationNumber: { $regex: search, $options: 'i' } },
                { model: { $regex: search, $options: 'i' } }
            ];
        }

        const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get single vehicle details
// @route   GET /api/vehicles/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        res.json(vehicle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a new vehicle
// @route   POST /api/vehicles
// @access  Private (Fleet Manager only)
router.post('/', protect, authorizeRoles('Fleet Manager'), async (req, res) => {
    const { registrationNumber, model, type, maxCapacity, odometer, acquisitionCost } = req.body;

    try {
        const existing = await Vehicle.findOne({
            registrationNumber: registrationNumber.toUpperCase().trim()
        });

        if (existing) {
            return res.status(400).json({ message: 'A vehicle with this registration number already exists.' });
        }

        const vehicle = await Vehicle.create({
            registrationNumber: registrationNumber.toUpperCase().trim(),
            model,
            type,
            maxCapacity,
            odometer,
            acquisitionCost,
            status: 'Available' // starts as Available
        });

        res.status(201).json(vehicle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Update vehicle details
// @route   PUT /api/vehicles/:id
// @access  Private (Fleet Manager only)
router.put('/:id', protect, authorizeRoles('Fleet Manager'), async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        // Check if unique registration number conflicts with another vehicle
        if (req.body.registrationNumber) {
            const reg = req.body.registrationNumber.toUpperCase().trim();
            const duplicate = await Vehicle.findOne({
                registrationNumber: reg,
                _id: { $ne: req.params.id }
            });
            if (duplicate) {
                return res.status(400).json({ message: 'A vehicle with this registration number already exists.' });
            }
            req.body.registrationNumber = reg;
        }

        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.json(updatedVehicle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private (Fleet Manager only)
router.delete('/:id', protect, authorizeRoles('Fleet Manager'), async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        await Vehicle.findByIdAndDelete(req.params.id);
        res.json({ message: 'Vehicle removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
