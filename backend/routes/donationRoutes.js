const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const statsController = require('../controllers/statsController');

router.post('/broadcast', donationController.broadcastDonation);
router.get('/my-stats', statsController.getDonorStats);

module.exports = router;
