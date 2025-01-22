const express = require('express');
const router = express.Router();
const GamingSession = require('../models/GamingSession');
const TimeLimit = require('../models/TimeLimit');
const auth = require('../middleware/auth');

// Start a gaming session
router.post('/session/start', auth, async (req, res) => {
  try {
    const { platformName, gameName } = req.body;

    // Check if there's already an active session
    const activeSession = await GamingSession.findOne({
      userId: req.user.id,
      status: 'active'
    });

    if (activeSession) {
      return res.status(400).json({ message: 'You already have an active gaming session' });
    }

    // Create new session
    const session = new GamingSession({
      userId: req.user.id,
      platformName,
      gameName,
      startTime: new Date()
    });

    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Error starting session' });
  }
});

// End a gaming session
router.post('/session/end', auth, async (req, res) => {
  try {
    const session = await GamingSession.findOne({
      userId: req.user.id,
      status: 'active'
    });

    if (!session) {
      return res.status(404).json({ message: 'No active session found' });
    }

    session.endTime = new Date();
    session.status = 'completed';
    session.duration = Math.round((session.endTime - session.startTime) / 60000); // Convert to minutes
    await session.save();

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Error ending session' });
  }
});

// Take a break
router.post('/session/break', auth, async (req, res) => {
  try {
    const session = await GamingSession.findOne({
      userId: req.user.id,
      status: 'active'
    });

    if (!session) {
      return res.status(404).json({ message: 'No active session found' });
    }

    const breakStart = new Date();
    session.status = 'paused';
    session.breaks.push({
      startTime: breakStart
    });

    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Error starting break' });
  }
});

// End break
router.post('/session/break/end', auth, async (req, res) => {
  try {
    const session = await GamingSession.findOne({
      userId: req.user.id,
      status: 'paused'
    });

    if (!session) {
      return res.status(404).json({ message: 'No paused session found' });
    }

    const currentBreak = session.breaks[session.breaks.length - 1];
    currentBreak.endTime = new Date();
    currentBreak.duration = Math.round((currentBreak.endTime - currentBreak.startTime) / 60000);
    session.status = 'active';

    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Error ending break' });
  }
});

// Get usage statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [dailyUsage, weeklyUsage] = await Promise.all([
      // Get today's total gaming time
      GamingSession.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId(req.user.id),
            startTime: { $gte: today },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            totalDuration: { $sum: '$duration' }
          }
        }
      ]),

      // Get weekly gaming time
      GamingSession.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId(req.user.id),
            startTime: { $gte: weekAgo },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            totalDuration: { $sum: '$duration' }
          }
        }
      ])
    ]);

    res.json({
      daily: dailyUsage[0]?.totalDuration || 0,
      weekly: weeklyUsage[0]?.totalDuration || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// Set time limits
router.post('/limits', auth, async (req, res) => {
  try {
    const { dailyLimit, weeklyLimit, breakInterval, breakDuration } = req.body;

    const limits = await TimeLimit.findOneAndUpdate(
      { userId: req.user.id },
      {
        dailyLimit,
        weeklyLimit,
        breakInterval,
        breakDuration
      },
      { upsert: true, new: true }
    );

    res.json(limits);
  } catch (error) {
    res.status(500).json({ message: 'Error setting time limits' });
  }
});

module.exports = router; 