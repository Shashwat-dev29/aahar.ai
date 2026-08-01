const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['donor', 'ngo','delivery'], required: true },
    defaultCoords: { type: [Number], required: true } // [lat, lon]
});

module.exports = mongoose.model('User', userSchema);