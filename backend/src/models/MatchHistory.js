const mongoose = require('mongoose');

const matchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameType: {
    type: String,
    enum: ['LeagueOfLegends', 'Valorant'],
    required: true
  },
  matchId: {
    type: String,
    required: true,
    unique: true
  },
  startTime: Date,
  endTime: Date,
  duration: Number, // in minutes
  gameMode: String,
  result: {
    type: String,
    enum: ['WIN', 'LOSS', 'DRAW']
  },
  performance: {
    // Common stats
    kills: Number,
    deaths: Number,
    assists: Number,
    score: Number,

    // Game-specific stats
    // League of Legends
    championPlayed: String,
    goldEarned: Number,
    cs: Number,
    vision: Number,

    // Valorant
    agent: String,
    headshots: Number,
    abilities: {
      ability1Casts: Number,
      ability2Casts: Number,
      ultimateCasts: Number
    }
  },
  metadata: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model('MatchHistory', matchHistorySchema); 