const express = require('express');
const Driver = require('../models/Driver');
const { protect, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

// @desc    Get all drivers (with filters)
// @route   GET /api/drivers
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = {};

        if (status) query.status = status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { licenseNumber: { $regex: search, $options: 'i' } }
            ];
        }

        const drivers = await Driver.find(query).sort({ createdAt: -1 });
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get single driver details
// @route   GET /api/drivers/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }
        res.json(driver);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a new driver profile
// @route   POST /api/drivers
// @access  Private (Fleet Manager or Safety Officer only)
router.post('/', protect, authorizeRoles('Fleet Manager', 'Safety Officer'), async (req, res) => {
    const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore } = req.body;

    try {
        const existing = await Driver.findOne({ licenseNumber: licenseNumber.trim() });
        if (existing) {
            return res.status(400).json({ message: 'A driver with this license number already exists.' });
        }

        const driver = await Driver.create({
            name,
            licenseNumber: licenseNumber.trim(),
            licenseCategory,
            licenseExpiryDate,
            contactNumber,
            safetyScore: safetyScore || 100,
            status: 'Available' // starts as Available
        });

        res.status(201).json(driver);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Update driver profile
// @route   PUT /api/drivers/:id
// @access  Private (Fleet Manager or Safety Officer only)
router.put('/:id', protect, authorizeRoles('Fleet Manager', 'Safety Officer'), async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        if (req.body.licenseNumber) {
            const license = req.body.licenseNumber.trim();
            const duplicate = await Driver.findOne({
                licenseNumber: license,
                _id: { $ne: req.params.id }
            });
            if (duplicate) {
                return res.status(400).json({ message: 'A driver with this license number already exists.' });
            }
            req.body.licenseNumber = license;
        }

        const updatedDriver = await Driver.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.json(updatedDriver);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete driver profile
// @route   DELETE /api/drivers/:id
// @access  Private (Fleet Manager only)
router.delete('/:id', protect, authorizeRoles('Fleet Manager'), async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        await Driver.findByIdAndDelete(req.params.id);
        res.json({ message: 'Driver removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
