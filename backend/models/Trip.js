const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    source: {
        type: String,
        required: true,
        trim: true
    },
    destination: {
        type: String,
        required: true,
        trim: true
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    cargoWeight: {
        type: Number,
        required: true // in kg
    },
    distance: {
        type: Number,
        required: true // in km
    },
    revenue: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
        default: 'Draft',
        required: true
    },
    finalOdometer: {
        type: Number
    },
    fuelConsumed: {
        type: Number // in Liters
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Trip', tripSchema);
