const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    registrationNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    model: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    maxCapacity: {
        type: Number,
        required: true // in kg
    },
    odometer: {
        type: Number,
        required: true,
        default: 0 // in km
    },
    acquisitionCost: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Available', 'On Trip', 'In Shop', 'Retired'],
        default: 'Available',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
