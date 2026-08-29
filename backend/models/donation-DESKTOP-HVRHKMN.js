const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    foodType: String,
    quantity: Number,
    donorCoords: [Number],
    status: { type: String, default: 'active' }, // active, accepted, completed
    assignedNgoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Donation', donationSchema);