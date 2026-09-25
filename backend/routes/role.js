const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const axios = require('axios');
const Donation = require('../models/donation');

// --- 1. REGISTER ---
router.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role, coords } = req.body;
    
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(409).json({ error: "Email already in use." });

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

        // Send Refresh Token as an httpOnly cookie
        res.cookie('jwt', refreshToken, { 
            httpOnly: true, 
            secure: true,
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
router.get('/api/auth/refresh', async (req, res) => {
    const cookies = req.cookies;
    
    if (!cookies?.jwt) return res.status(401).json({ error: "No refresh token provided." });
    
    const refreshToken = cookies.jwt;

    jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ error: "Invalid or expired refresh token." });

        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ error: "User not found." });

        // Issue a new Access Token
        const accessToken = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '15m' }
        );

        res.json({ accessToken, role: user.role });
    });
});

// --- 4. LOGOUT ---
router.post('/api/auth/logout', (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);
    
    // Clear the cookie — flags MUST match the ones used when setting it
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    res.json({ message: "Logged out successfully" });
});

// --- 5. BROADCAST DONATION ---
router.post('/api/donations/broadcast', async (req, res) => {
    const { donorId, foodType, quantity, prepTime, currentTemp, donorCoords } = req.body;

    const io = req.app.get('io');
    const connectedNgos = req.app.get('connectedNgos');

    try {
        let savedDonation = null;
        let isSpoiled = false;

        const promises = Array.from(connectedNgos.entries()).map(async ([socketId, ngo]) => {
            try {
                const pyRes = await axios.post(process.env.PYTHON_ENGINE_URL, {
                    food_type: foodType,
                    prep_time_str: prepTime,
                    current_temp: parseFloat(currentTemp),
                    quantity: parseInt(quantity),
                    donor_coords: donorCoords,
                    ngo_coords: ngo.coords
                });
                return { socketId, result: pyRes.data };
            } catch (err) {
                return null; // Ignore failed requests to Python engine
            }
        });

        const responses = await Promise.all(promises);

        for (const resData of responses) {
            if (!resData) continue;
            const { socketId, result } = resData;

            if (result.donation_status === 'REJECTED' && result.reason === 'Food is spoiled.') {
                isSpoiled = true;
                break; // Stop assigning if food is completely spoiled
            }

            if (result.donation_status === 'APPROVED_FOR_PICKUP') {
                if (!savedDonation) {
                    // Create only once
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

        // Delivery agents are notified via 'ngo_accepted_donation' socket event in server.js

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

// --- 6. STATS ---
router.get('/api/stats', async (req, res) => {
    const total = await Donation.countDocuments();
    res.json({ mealsServed: total * 25, foodSavedKg: total * 5 });
});

module.exports = router;
