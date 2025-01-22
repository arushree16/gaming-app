const express = require('express');
const router = express.Router();
const GameAnalysisService = require('../services/gameAnalysisService');
const auth = require('../middleware/auth');

// Pre-game analysis
router.get('/analyze-game-type/:gameType', auth, async (req, res) => {
    try {
        const analysis = await GameAnalysisService.analyzeGameType(req.params.gameType);
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ message: 'Error analyzing game type', error: error.message });
    }
});

// Real-time match analysis
router.post('/analyze-match', auth, async (req, res) => {
    try {
        const analysis = await GameAnalysisService.analyzeRealTimeMatch(req.body);
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ message: 'Error analyzing match', error: error.message });
    }
});

module.exports = router; 