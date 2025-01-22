const express = require('express');
const router = express.Router();
const GameProfile = require('../models/GameProfile');
const auth = require('../middleware/auth');

// Add a gaming platform
router.post('/platform', auth, async (req, res) => {
  try {
    const { platformName, username } = req.body;
    
    let profile = await GameProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      profile = new GameProfile({
        userId: req.user.id,
        platforms: []
      });
    }

    // Check if platform already exists
    if (profile.platforms.some(p => p.name === platformName)) {
      return res.status(400).json({ message: 'Platform already added' });
    }

    profile.platforms.push({
      name: platformName,
      username: username,
      games: []
    });

    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error('Error adding platform:', error);
    res.status(500).json({ message: 'Error adding gaming platform' });
  }
});

// Add a game to a platform
router.post('/platform/:platformName/game', auth, async (req, res) => {
  try {
    const { gameName, totalPlaytime } = req.body;
    const { platformName } = req.params;

    const profile = await GameProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Gaming profile not found' });
    }

    const platform = profile.platforms.find(p => p.name === platformName);
    if (!platform) {
      return res.status(404).json({ message: 'Platform not found' });
    }

    platform.games.push({
      name: gameName,
      totalPlaytime: totalPlaytime || 0,
      lastPlayed: new Date(),
      favorite: false
    });

    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error('Error adding game:', error);
    res.status(500).json({ message: 'Error adding game' });
  }
});

// Get gaming profile
router.get('/profile', auth, async (req, res) => {
  try {
    const profile = await GameProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Gaming profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gaming profile' });
  }
});

// Get all game profiles
router.get('/', async (req, res) => {
    try {
        const games = await GameProfile.find({ userId: req.user.userId }); // Assuming you have userId in the model
        res.json(games);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching games' });
    }
});

// Add a new game profile
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        const newGame = new GameProfile({ name, userId: req.user.userId }); // Assuming you have userId in the model
        await newGame.save();
        res.status(201).json(newGame);
    } catch (error) {
        res.status(500).json({ message: 'Error adding game' });
    }
});

// Delete a game profile
router.delete('/:id', async (req, res) => {
    try {
        await GameProfile.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting game' });
    }
});

module.exports = router; 