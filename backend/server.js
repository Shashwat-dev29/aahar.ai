const dns=require('dns')
dns.setServers(['1.1.1.1', '8.8.8.8']);
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Explicitly defining allowed methods for Socket.io CORS (Typo fixed)
const io = new Server(server, {
    cors: {
        origin:["http://127.0.0.1:5500","http://localhost:5173"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    }
});

connectDB();

// Express CORS
app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5500"], 
    credentials: true }));
app.use(express.json());

const connectedNgos = new Map();
const connectedDeliveryAgents = new Map();

io.on('connection', (socket) => {
    // NGO registration
    socket.on('register_ngo', (data) => {
        connectedNgos.set(socket.id, { ngoId: data.id, coords: data.coords });
        console.log(`NGO Registered for Live Feed: ${data.id}`);
    });

    // Delivery agent registration
    socket.on('register_delivery', (data) => {
        connectedDeliveryAgents.set(socket.id, { agentId: data.id, coords: data.coords });
        console.log(`Delivery Agent Registered: ${data.id}`);
    });

    socket.on('delivery_location_update', (data) => {
        // Update stored coords for this delivery agent
        for (let [sid, agent] of connectedDeliveryAgents.entries()) {
            if (agent.agentId === data.id) {
                agent.coords = data.coords;
                break;
            }
        }
        // Broadcast the GPS ping to all connected users instantly
        socket.broadcast.emit('update_delivery_marker', data);
    });

    socket.on('disconnect', () => {
        connectedNgos.delete(socket.id);
        connectedDeliveryAgents.delete(socket.id);
    });
});

// Share these variables so role.js can use them
app.set('io', io);
app.set('connectedNgos', connectedNgos);
app.set('connectedDeliveryAgents', connectedDeliveryAgents);

// Import and use your route file
const roleRoutes = require('./routes/role');
app.use('/', roleRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Node Gateway running on port ${PORT}`));