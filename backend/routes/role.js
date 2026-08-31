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



// const express = require("express");
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const axios = require('axios'); // <-- 1. Added missing axios import
// const router = express.Router();
// const User = require('../models/User');
// const Donation = require('../models/donation');

// router.post('/api/auth/login', async (req, res) => {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//         return res.status(400).json({ error: "Invalid credentials" });
//     }
//     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
//     res.cookie("token", token, { maxAge: 60 * 60 * 24 });
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

//     // 2. Grab the live socket variables from the Express app object
//     const io = req.app.get('io');
//     const connectedNgos = req.app.get('connectedNgos');

//     try {
//         let savedDonation = null;
//         let isSpoiled = false;

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
//     res.json({ mealsServed: total * 25, foodSavedKg: total * 5 });
// });

// module.exports = router;








const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Ensure correct path
const router = express.Router();

// --- 1. REGISTER ---
router.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role, coords } = req.body;
    
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(409).json({ error: "Email already in use." });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const user = new User({ 
            name, 
            email, 
            password: hashedPassword, 
            role, 
            defaultCoords: coords 
        });
        
        await user.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        res.status(500).json({ error: "Registration failed." });
    }
});

// --- 2. LOGIN ---
router.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Create Access Token (Short-lived, sent in JSON response)
        const accessToken = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '15m' }
        );

        // Create Refresh Token (Long-lived, sent in secure cookie)
        const refreshToken = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        // Send Refresh Token as an httpOnly cookie (cannot be accessed by frontend JS)
        res.cookie('jwt', refreshToken, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', // Use true if hosted on HTTPS
            sameSite: 'None', 
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Send Access Token and user data to the frontend
        res.json({ 
            accessToken, 
            role: user.role, 
            id: user._id, 
            email: user.email,
            coords: user.defaultCoords 
        });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Login failed." });
    }
});

// --- 3. REFRESH TOKEN ---
// This route is called by the frontend when the access token expires
router.get('/api/auth/refresh', async (req, res) => {
    const cookies = req.cookies;
    
    if (!cookies?.jwt) return res.status(401).json({ error: "No refresh token provided." });
    
    const refreshToken = cookies.jwt;

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ error: "Invalid or expired refresh token." });

        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ error: "User not found." });

        // Issue a new Access Token
        const accessToken = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.ACCESS_TOKEN_SECRET, 
            { expiresIn: '15m' }
        );

        res.json({ accessToken, role: user.role });
    });
});

// --- 4. LOGOUT ---
router.post('/api/auth/logout', (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); // No content
    
    // Clear the cookie
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    res.json({ message: "Logged out successfully" });
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
