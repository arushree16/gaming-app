const express = require('express');
const router = express.Router();
const FraudDetectionService = require('../services/fraudDetectionService');
const auth = require('../middleware/auth');

// Screen user for fraud
router.post('/screen', auth, async (req, res) => {
    try {
        const userData = {
            userId: req.user.id,
            ip: req.ip,
            email: req.user.email,
            username: req.user.username,
            sessionId: req.sessionID,
            ...req.body
        };

        const assessment = await FraudDetectionService.screenUser(userData);
        res.json(assessment);
    } catch (error) {
        res.status(500).json({ 
            error: 'Fraud detection failed', 
            details: error.message 
        });
    }
});

// Get user's risk history
router.get('/history', auth, async (req, res) => {
    try {
        const history = await FraudDetectionService.getUserHistory(req.user.id);
        res.json(history);
    } catch (error) {
        res.status(500).json({ 
            error: 'Could not fetch history', 
            details: error.message 
        });
    }
});

module.exports = router; 