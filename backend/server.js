require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const cluster=require('cluster')
const os=require('os');
const cookieParser = require('cookie-parser');
const{createAdapter}=require('@socket.io/redis-adapter');

const redisClient=require('./services/redisService');
const connectDB = require('./config/db');
const rateLimiter = require('./middleware/rateLimiter');
const socketService = require('./services/socketService');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const donationRoutes = require('./routes/donationRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const server = http.createServer(app);

// Database Connection
connectDB();

// Middleware
app.use(cookieParser());
app.use(rateLimiter);
app.use(cors({ 
    origin: ["http://localhost:5173", "http://127.0.0.1:5500"], 
    credentials: true 
}));
app.use(express.json());

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin:["http://127.0.0.1:5500","http://localhost:5173"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    }
});
const pubClient=redisClient.duplicate();
const subClient=redisClient.duplicate();
Promise.all([pubClient.connect(),subClient.connect()]).then(()=>{
    io.adapter(createAdapter(pubClient,subClient));
    console.log("[Socket.Io]Redis Adapter attached successfully");
});

const connectedNgos = new Map();
const connectedDeliveryAgents = new Map();

// Initialize Socket Service
socketService.init(io, connectedNgos, connectedDeliveryAgents);

// Share variables for legacy or direct access if needed
app.set('io', io);
app.set('connectedNgos', connectedNgos);
app.set('connectedDeliveryAgents', connectedDeliveryAgents);

// Export io for modules that might require it directly
exports.io = io;

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/stats', statsRoutes);

// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => console.log(`Node Gateway running on port ${PORT}`));

const PORT = process.env.PORT || 3000;
const numCPUs = os.cpus().length;
if(cluster.isPrimary)
{
    console.log(`[Master] Load Balancer is starting on PID ${process.pid}`);
    console.log(`[Master] spawning ${numCPUs}Worker Servers..`);
    

for(let i=0;i<numCPUs;i++)
{
    cluster.fork();
}
cluster.on('exit',(worker,code,signal)=>{
    console.log(`[Master] Worker ${worker.process.pid}died.  Spawning a new one...`);
    cluster.fork();
});
}
else{
    server.listen(PORT,()=>{
        console.log(`[Worker${process.pid}]Node server running on ${PORT}`);
    })
}
