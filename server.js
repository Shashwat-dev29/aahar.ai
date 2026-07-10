const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const connectDB = require('./config/db');

const User = require('./models/User');
const Donation = require('./models/donation');

const app = express();
const server = http.createServer(app);

// FIX 1: Explicitly defining allowed methods for Socket.io CORS
const io = new Server(server, { 
    cors: { 
        origin: "*",
        methods: ["GET", "POST"]
    } 
});

connectDB();

// Express CORS is fine as-is
app.use(cors());
app.use(express.json());

const connectedNgos = new Map();

io.on('connection', (socket) => {
    socket.on('register_ngo', (data) => {
        connectedNgos.set(socket.id, { ngoId: data.id, coords: data.coords });
        console.log(` NGO Registered for Live Feed: ${data.id}`);
    });
    socket.on('disconnect', () => connectedNgos.delete(socket.id));
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role, coords } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({ name, email, password: hashedPassword, role, defaultCoords: coords });
    await user.save();
    res.status(201).json({ message: "User created" });
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, role: user.role, id: user._id, coords: user.defaultCoords });
});

// Broadcast Route (Connects to Python)
app.post('/api/donations/broadcast', async (req, res) => {
    const { donorId, foodType, quantity, prepTime, currentTemp, donorCoords } = req.body;

    try {
        let savedDonation = null;
        let isSpoiled = false; // FIX 2: Added the spoiled tracker back in

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

            // FIX 2: Stop searching and reject if Python says it's spoiled
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

        // FIX 2: Send the correct message back to the frontend
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

// Impact Tracker
app.get('/api/stats', async (req, res) => {
    const total = await Donation.countDocuments();
    res.json({ mealsServed: total * 25, foodSavedKg: total * 5 }); // Mock multipliers
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Node Gateway running on port ${PORT}`));