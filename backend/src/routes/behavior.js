const express = require('express');
const router = express.Router();
const AIAnalysisService = require('../services/aiAnalysisService');
const auth = require('../middleware/auth');

// Analyze chat message
router.post('/analyze', auth, async (req, res) => {
  try {
    const { content, type, context } = req.body;
    
    // Validate input
    if (!content || !type) {
      return res.status(400).json({ 
        message: 'Content and type are required' 
      });
    }

    const analysis = await AIAnalysisService.analyzeBehavior(req.user.id, {
      content,
      type,
      context,
      sessionId: req.body.sessionId
    });

    res.json(analysis);
  } catch (error) {
    console.error('Behavior analysis error:', error);
    res.status(500).json({ 
      message: 'Error analyzing behavior',
      error: error.message 
    });
  }
});

// Get behavior report
router.get('/report', auth, async (req, res) => {
  try {
    const report = await AIAnalysisService.getBehaviorReport(req.user.id);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error generating behavior report' });
  }
});

module.exports = router; 