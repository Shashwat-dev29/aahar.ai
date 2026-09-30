const Donation = require('../models/donation');
const User = require('../models/User');

exports.getGlobalStats = async (req, res) => {
    try {
        const total = await Donation.countDocuments();
        res.json({ mealsServed: total * 25, foodSavedKg: total * 5 });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch stats." });
    }
};

exports.getDonorStats = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: "Email is required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        const donations = await Donation.find({ donorId: user._id }).sort({ createdAt: -1 }).limit(10);
        
        let totalDonations = await Donation.countDocuments({ donorId: user._id });
        let activeListings = await Donation.countDocuments({ donorId: user._id, status: 'active' });
        
        let impactScore = 5.0; // Default max
        if (totalDonations < 5) impactScore = 4.5;
        if (totalDonations === 0) impactScore = 0;

        const allDonations = await Donation.find({ donorId: user._id });
        let totalPeopleFed = 0;
        allDonations.forEach(d => totalPeopleFed += (d.quantity || 0));

        res.json({
            stats: {
                totalDonations,
                peopleFed: totalPeopleFed,
                activeListings,
                impactScore: impactScore.toFixed(1)
            },
            recentDonations: donations
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch stats." });
    }
};
