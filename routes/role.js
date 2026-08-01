// const express=require("express")
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const router=express.Router()
// const User = require('./models/User');
// const axios = require('axios');
// const Donation = require('./models/donation');
// router.post('/api/auth/login', async (req, res) => {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//         return res.status(400).json({ error: "Invalid credentials" });
//     }
//     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
//     res.cookie("token",token,{maxAge:60*60*24})
//     res.json({ token, role: user.role, id: user._id, coords: user.defaultCoords });
// });
// router.post('/api/auth/register', async (req, res) => {
//     const { name, email, password, role, coords } = req.body;
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);
//     const user = new User({ name, email, password: hashedPassword, role, defaultCoords: coords });
//     await user.save();
//     res.status(201).json({ message: "User created" });
// });
// router.post('/api/donations/broadcast', async (req, res) => {
//     const { donorId, foodType, quantity, prepTime, currentTemp, donorCoords } = req.body;

//     try {
//         let savedDonation = null;
//         let isSpoiled = false; // FIX 2: Added the spoiled tracker back in

//         for (let [socketId, ngo] of connectedNgos.entries()) {
//             const pyRes = await axios.post(process.env.PYTHON_ENGINE_URL, {
//                 food_type: foodType,
//                 prep_time_str: prepTime,
//                 current_temp: parseFloat(currentTemp),
//                 quantity: parseInt(quantity),
//                 donor_coords: donorCoords,
//                 ngo_coords: ngo.coords
//             });

//             const result = pyRes.data;

//             // FIX 2: Stop searching and reject if Python says it's spoiled
//             if (result.donation_status === 'REJECTED' && result.reason === 'Food is spoiled.') {
//                 isSpoiled = true;
//                 break; 
//             }

//             if (result.donation_status === 'APPROVED_FOR_PICKUP') {
//                 if (!savedDonation) {
//                     savedDonation = await Donation.create({ donorId, foodType, quantity, donorCoords });
//                 }
//                 io.to(socketId).emit('new_food_alert', {
//                     donationId: savedDonation._id,
//                     foodType, quantity, 
//                     routing: result.routing_analysis,
//                     shelfLife: result.shelf_life_analysis
//                 });
//             }
//         }

//         // FIX 2: Send the correct message back to the frontend
//         if (isSpoiled) {
//             return res.status(400).json({ error: "AI Warning: This food has exceeded its safe shelf-life and cannot be distributed." });
//         } else if (savedDonation) {
//             return res.json({ message: "Broadcasted successfully!" });
//         } else {
//             return res.status(400).json({ error: "No feasible NGOs found in range." });
//         }
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Engine calculation failed." });
//     }
// });
// router.get('/api/stats', async (req, res) => {
//     const total = await Donation.countDocuments();
//     res.json({ mealsServed: total * 25, foodSavedKg: total * 5 }); // Mock multipliers
// });
// module.exports = router;



const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // <-- 1. Added missing axios import
const router = express.Router();
const User = require('../models/User');
const Donation = require('../models/donation');

router.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.cookie("token", token, { maxAge: 60 * 60 * 24 });
    res.json({ token, role: user.role, id: user._id, coords: user.defaultCoords });
});

router.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role, coords } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({ name, email, password: hashedPassword, role, defaultCoords: coords });
    await user.save();
    res.status(201).json({ message: "User created" });
});

router.post('/api/donations/broadcast', async (req, res) => {
    const { donorId, foodType, quantity, prepTime, currentTemp, donorCoords } = req.body;

    // 2. Grab the live socket variables from the Express app object
    const io = req.app.get('io');
    const connectedNgos = req.app.get('connectedNgos');

    try {
        let savedDonation = null;
        let isSpoiled = false;

        for (let [socketId, ngo] of connectedNgos.entries()) {
            const pyRes = await axios.post(process.env.PYTHON_ENGINE_URL, {
                food_type: foodType,
                prep_time_str: prepTime,
                current_temp: parseFloat(currentTemp),
                quantity: parseInt(quantity),
                donor_coords: donorCoords,
                ngo_coords: ngo.coords
            });

            const result = pyRes.data;

            if (result.donation_status === 'REJECTED' && result.reason === 'Food is spoiled.') {
                isSpoiled = true;
                break; 
            }

            if (result.donation_status === 'APPROVED_FOR_PICKUP') {
                if (!savedDonation) {
                    savedDonation = await Donation.create({ donorId, foodType, quantity, donorCoords });
                }
                io.to(socketId).emit('new_food_alert', {
                    donationId: savedDonation._id,
                    foodType, quantity, 
                    routing: result.routing_analysis,
                    shelfLife: result.shelf_life_analysis
                });
            }
        }

        if (isSpoiled) {
            return res.status(400).json({ error: "AI Warning: This food has exceeded its safe shelf-life and cannot be distributed." });
        } else if (savedDonation) {
            return res.json({ message: "Broadcasted successfully!" });
        } else {
            return res.status(400).json({ error: "No feasible NGOs found in range." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Engine calculation failed." });
    }
});

router.get('/api/stats', async (req, res) => {
    const total = await Donation.countDocuments();
    res.json({ mealsServed: total * 25, foodSavedKg: total * 5 }); 
});

module.exports = router;
