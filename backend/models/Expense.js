const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    category: {
        type: String,
        enum: ['Fuel', 'Toll', 'Maintenance', 'Insurance', 'Other'],
        default: 'Fuel',
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    liters: {
        type: Number // logs only if category = Fuel
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
