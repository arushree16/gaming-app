const express = require('express');
const router = express.Router();
const RiotIntegration = require('../models/RiotIntegration');
const MatchHistory = require('../models/MatchHistory');
const GamingSession = require('../models/GamingSession');
const riotService = require('../services/riotService');
const GameStatsService = require('../services/gameStatsService');
const auth = require('../middleware/auth');

// Connect Riot account
router.post('/connect', auth, async (req, res) => {
  try {
    const { gameName, tagLine, region } = req.body;

    // Verify Riot account
    const riotAccount = await riotService.getAccountByRiotId(gameName, tagLine);

    // Create or update Riot integration
    const riotIntegration = await RiotIntegration.findOneAndUpdate(
      { userId: req.user.id },
      {
        riotId: riotAccount.gameName,
        gameName: riotAccount.gameName,
        tagLine: riotAccount.tagLine,
        puuid: riotAccount.puuid,
        region,
        lastChecked: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Riot account connected successfully',
      integration: riotIntegration
    });
  } catch (error) {
    console.error('Riot connection error:', error);
    res.status(500).json({ message: 'Error connecting Riot account' });
  }
});

// Check current game status
router.get('/status', auth, async (req, res) => {
  try {
    const integration = await RiotIntegration.findOne({ userId: req.user.id });
    if (!integration) {
      return res.status(404).json({ message: 'Riot account not connected' });
    }

    // Check both games
    const [lolStatus, valorantStatus] = await Promise.all([
      riotService.checkActiveLoLGame(integration.riotId, integration.region),
      riotService.checkValorantStatus(integration.gameName, integration.tagLine)
    ]);

    const isPlaying = lolStatus.isPlaying || valorantStatus.isPlaying;
    const gameType = lolStatus.isPlaying ? 'LeagueOfLegends' : 'Valorant';

    // Update or create gaming session if playing
    if (isPlaying) {
      let session = await GamingSession.findOne({
        userId: req.user.id,
        status: 'active'
      });

      if (!session) {
        session = new GamingSession({
          userId: req.user.id,
          platformName: 'Riot',
          gameName: gameType,
          startTime: new Date()
        });
        await session.save();
      }
    }

    res.json({
      isPlaying,
      gameType: isPlaying ? gameType : null,
      lastChecked: new Date()
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ message: 'Error checking game status' });
  }
});

// Get match history
router.get('/matches', auth, async (req, res) => {
  try {
    const { gameType = 'all', limit = 10 } = req.query;
    const matches = await MatchHistory.find({
      userId: req.user.id,
      ...(gameType !== 'all' && { gameType })
    })
    .sort({ startTime: -1 })
    .limit(parseInt(limit));

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching match history' });
  }
});

// Get game statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const { gameType } = req.query;
    const stats = await GameStatsService.calculateStats(req.user.id, gameType);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// Get break analysis
router.get('/breaks', auth, async (req, res) => {
  try {
    const session = await GamingSession.findOne({
      userId: req.user.id,
      status: 'active'
    });

    if (!session) {
      return res.json({ breaks: [] });
    }

    const breakHistory = session.breaks.map(breakItem => ({
      duration: breakItem.duration,
      startTime: breakItem.startTime,
      endTime: breakItem.endTime,
      isEffective: breakItem.duration >= 15 // Minimum effective break
    }));

    res.json({
      breaks: breakHistory,
      totalBreakTime: breakHistory.reduce((sum, b) => sum + b.duration, 0),
      averageBreakDuration: breakHistory.length ? 
        breakHistory.reduce((sum, b) => sum + b.duration, 0) / breakHistory.length : 0
    });
  } catch (error) {
    console.error('Break analysis error:', error);
    res.status(500).json({ message: 'Error fetching break analysis' });
  }
});

module.exports = router; 