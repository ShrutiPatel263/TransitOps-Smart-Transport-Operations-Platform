const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    cost: {
        type: Number,
        required: true,
        default: 0
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    endDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Active', 'Closed'],
        default: 'Active',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);
