const express = require('express');
const router = express.Router();
const RealTimeMonitoringService = require('../services/realTimeMonitoringService');
const auth = require('../middleware/auth');

// Start monitoring
router.post('/start', auth, async (req, res) => {
    try {
        const result = await RealTimeMonitoringService.startMonitoring(
            req.user.id,
            req.sessionID
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to start monitoring',
            details: error.message 
        });
    }
});

// Record user action
router.post('/action', auth, async (req, res) => {
    try {
        await RealTimeMonitoringService.recordAction(
            req.user.id,
            req.body
        );
        res.json({ message: 'Action recorded' });
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to record action',
            details: error.message 
        });
    }
});

// Stop monitoring
router.post('/stop', auth, async (req, res) => {
    try {
        const result = await RealTimeMonitoringService.stopMonitoring(req.user.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to stop monitoring',
            details: error.message 
        });
    }
});

// Get current monitoring status
router.get('/status', auth, async (req, res) => {
    try {
        const status = await RealTimeMonitoringService.getStatus(req.user.id);
        res.json(status);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to get status',
            details: error.message 
        });
    }
});

module.exports = router; 