const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    location: { type: String, required: true, trim: true },
    eventDate: { type: Date, required: true },
    closesAt: { type: Date, required: true },
    capacity: { type: Number, required: true, min: 1, max: 100 },
    approvedCount: { type: Number, default: 0, min: 0 },
    closedAt: { type: Date, default: null },
    organiser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Opportunity', opportunitySchema);