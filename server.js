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
const roleRouter=require("./routes/role")

// FIX 1: Explicitly defining allowed methods for Socket.io CORS
const io = new Server(server, { 
    cors: { 
        origin: "http://127.0.0.1:5500",
        methods: ["GET", "POST","PUT","PATCH","DELETE,OPTIONS"]
    } 
});

connectDB();

// Express CORS is fine as-is
app.use(cors({ origin: "http://127.0.0.1:5500" }));
app.use(express.json());

const connectedNgos = new Map();

io.on('connection', (socket) => {
    socket.on('register_ngo', (data) => {
        connectedNgos.set(socket.id, { ngoId: data.id, coords: data.coords });
        console.log(` NGO Registered for Live Feed: ${data.id}`);
    });
    socket.on('disconnect', () => connectedNgos.delete(socket.id));
});

// Share these variables so role.js can use them
app.set('io', io);
app.set('connectedNgos', connectedNgos);

// Import and use your new route file
const roleRoutes = require('./routes/role');
app.use('/', roleRoutes);




// Broadcast Route (Connects to Python)


// Impact Tracker

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Node Gateway running on port ${PORT}`));