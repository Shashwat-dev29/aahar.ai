const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db');

const app = express();
const server = http.createServer(app);

// Explicitly defining allowed methods for Socket.io CORS (Typo fixed)
const io = new Server(server, {
    cors: {
        origin: "http://127.0.0.1:5500",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    }
});

connectDB();

// Express CORS
app.use(cors({ origin: "http://127.0.0.1:5500" }));
app.use(express.json());

const connectedNgos = new Map();

io.on('connection', (socket) => {
    socket.on('register_ngo', (data) => {
        connectedNgos.set(socket.id, { ngoId: data.id, coords: data.coords });
        console.log(`NGO Registered for Live Feed: ${data.id}`);
    });

    socket.on('delivery_location_update', (data) => {
        // Broadcast the GPS ping to all connected users instantly
        socket.broadcast.emit('update_delivery_marker', data);
    });

    socket.on('disconnect', () => connectedNgos.delete(socket.id));
});

// Share these variables so role.js can use them
app.set('io', io);
app.set('connectedNgos', connectedNgos);

// Import and use your route file
const roleRoutes = require('./routes/role');
app.use('/', roleRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Node Gateway running on port ${PORT}`));