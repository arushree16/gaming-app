const express = require('express');
const router = express.Router();
const RealTimeAnalysisService = require('../services/realTimeAnalysisService');
const auth = require('../middleware/auth');

// Start real-time analysis for a game
router.post('/start', auth, async (req, res) => {
    try {
        const { gameId, gameType } = req.body;
        const result = await RealTimeAnalysisService.startGameAnalysis(
            gameId,
            gameType,
            req.user.id
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error starting analysis', error: error.message });
    }
});

// Add game event for analysis
router.post('/event/:gameId', auth, async (req, res) => {
    try {
        await RealTimeAnalysisService.addGameEvent(req.params.gameId, req.body);
        res.json({ message: 'Event added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding event', error: error.message });
    }
});

// End game analysis
router.post('/end/:gameId', auth, async (req, res) => {
    try {
        const analysis = await RealTimeAnalysisService.endGameAnalysis(req.params.gameId);
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ message: 'Error ending analysis', error: error.message });
    }
});

// Get current analysis
router.get('/:gameId', auth, async (req, res) => {
    try {
        const analysis = RealTimeAnalysisService.getGameAnalysis(req.params.gameId);
        if (!analysis) {
            return res.status(404).json({ message: 'Analysis not found' });
        }
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ message: 'Error getting analysis', error: error.message });
    }
});

// Get analysis history
router.get('/history/:gameId', auth, async (req, res) => {
    try {
        const history = RealTimeAnalysisService.getAnalysisHistory(req.params.gameId);
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error getting history', error: error.message });
    }
});

module.exports = router; 