let connectedNgos;
let connectedDeliveryAgents;
const redisClient=require('./redisService');
exports.init = (io, ngosMap, deliveryAgentsMap) => {
    connectedNgos = ngosMap;
    connectedDeliveryAgents = deliveryAgentsMap;

    io.on('connection', (socket) => {
        // NGO registration
        socket.on('register_ngo', async (data) => {
            await redisClient.hSet('connectedNgos',socket.id, JSON.stringify({ngoId: data.id, coords:data.coords}))
            // connectedNgos.set(socket.id, { ngoId: data.id, coords: data.coords });
            console.log(`NGO Registered for Live Feed: ${data.id}`);
        });

        // Delivery agent registration
        socket.on('register_delivery', async (data) => {
            await redisClient.hSet('connectedDeliveryAgents', socket.id, JSON.stringify({ agentId: data.id, coords: data.coords }));
            console.log(`Delivery Agent Registered in Redis: ${data.id}`);
        });

        socket.on('delivery_location_update', async (data) => {
            // Update stored coords for this delivery agent in Redis
            const agentString = await redisClient.hGet('connectedDeliveryAgents', socket.id);
            if (agentString) {
                const agent = JSON.parse(agentString);
                agent.coords = data.coords;
                await redisClient.hSet('connectedDeliveryAgents', socket.id, JSON.stringify(agent));
                // Broadcast to NGOs
                socket.broadcast.emit('update_delivery_marker', { agentId: data.id, coords: data.coords });
            }
        });

        // When NGO accepts a donation, notify delivery agents
        socket.on('ngo_accepted_donation', (data) => {
            // Find nearby agents using the in-memory map
            const ioInstance = require('../server').io; // If needed, though broadcast usually suffices
            socket.broadcast.emit('new_delivery_request', data);
        });

        // When Delivery Agent accepts the delivery
        socket.on('delivery_accept_request', async (data) => {
            try {
                const Donation = require('../models/donation');
                
                const donation = await Donation.findById(data.donationId);
                if (!donation) return;

                if (donation.assignedDeliveryAgentId) {
                    // Task was already claimed by someone else
                    socket.emit('delivery_already_claimed', { donationId: data.donationId });
                } else {
                    // Claim it for this agent
                    donation.assignedDeliveryAgentId = data.agentId;
                    await donation.save();
                    
                    // Confirm success to the agent who clicked it
                    socket.emit('delivery_accept_success', { donationId: data.donationId });
                    
                    // Tell all OTHER agents to remove it from their screen
                    socket.broadcast.emit('delivery_claimed_by_other', { donationId: data.donationId });
                }
            } catch (err) {
                console.error("Error accepting delivery:", err);
            }
        });

        // When delivery agent updates status (picked up, delivered)
        socket.on('delivery_status_update', (data) => {
            socket.broadcast.emit('delivery_status_updated', data);
        });

        socket.on('disconnect', async() => {
            await redisClient.hDel('connectedNgos', socket.id);
            await redisClient.hDel('connectedDeliveryAgents', socket.id);
        });
    });
};
