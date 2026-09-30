const Donation = require('../models/donation');
const aiService = require('../services/aiService');
const User = require('../models/User');
const redisClient =require('../services/redisService');
exports.broadcastDonation = async (req, res) => {
    const { donorId, foodType, quantity, prepTime, currentTemp, donorCoords } = req.body;

    if (!donorId || !foodType || !quantity || !prepTime || !currentTemp || !donorCoords) {
        return res.status(400).json({ error: "Missing required fields for broadcast." });
    }

    try {
        let savedDonation = null;
        let isSpoiled = false;

        // 1. Fetch ALL connected NGOs from the Redis Cloud!
        const rawNgos = await redisClient.hGetAll('connectedNgos');
        const ngoEntries = Object.entries(rawNgos); // Fix: Object.entries, not Object.enteries
        
        console.log(`[DEBUG] Number of connected NGOs across entire cluster: ${ngoEntries.length}`);

        // 2. Loop through them and test the AI
        const promises = ngoEntries.map(async ([socketId, ngoString]) => {
            const ngo = JSON.parse(ngoString);
            const result = await aiService.evaluateDonation(foodType, prepTime, currentTemp, quantity, donorCoords, ngo.coords);
            return { socketId, result };
        });
          const io = require('../server').io;

        const responses = await Promise.all(promises);

        for (const resData of responses) {
            if (!resData.result) continue;
            const { socketId, result } = resData;
            console.log(`[DEBUG] Python Engine Response for NGO ${socketId}:`, result);

            if (result.donation_status === 'REJECTED' && result.reason === 'Food is spoiled.') {
                isSpoiled = true;
                break; // Stop assigning if food is completely spoiled
            }

            if (result.donation_status === 'APPROVED_FOR_PICKUP') {
                if (!savedDonation) {
                    const donorUser = await User.findOne({ email: donorId });
                    const donorObjectId = donorUser ? donorUser._id : null;
                    savedDonation = await Donation.create({ donorId: donorObjectId, foodType, quantity, donorCoords });
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
};
