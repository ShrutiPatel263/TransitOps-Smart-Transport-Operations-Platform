const express = require('express');
const Expense = require('../models/Expense');
const Vehicle = require('../models/Vehicle');
const { protect, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

// @desc    Get all expenses (with filters)
// @route   GET /api/expenses
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { vehicle, category } = req.query;
    let query = {};

    if (vehicle) query.vehicle = vehicle;
    if (category) query.category = category;

    const expenses = await Expense.find(query)
      .populate('vehicle')
      .sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new expense entry
// @route   POST /api/expenses
// @access  Private (Fleet Manager or Financial Analyst)
router.post('/', protect, authorizeRoles('Fleet Manager', 'Financial Analyst'), async (req, res) => {
  const { vehicle: vehicleId, category, cost, liters, date, description } = req.body;

  try {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found.' });
    }

    if (category === 'Fuel' && (!liters || liters <= 0)) {
      return res.status(400).json({ message: 'Fuel expense category requires liters count greater than 0.' });
    }

    const expense = await Expense.create({
      vehicle: vehicleId,
      category,
      cost,
      liters: category === 'Fuel' ? liters : undefined,
      date: date || new Date(),
      description
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
