const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  matchId: {
    type: String,
    required: true,
    unique: true
  },
  gameType: {
    type: String,
    required: true
  },
  playerStats: {
    shots: Number,
    hits: Number,
    accuracy: Number
  },
  skillAnalysis: {
    skillPercentage: Number,
    chancePercentage: Number,
    classification: {
      type: String,
      enum: ['SKILL_BASED', 'MIXED', 'CHANCE_BASED']
    },
    confidence: Number,
    skillFactors: {
      aimAccuracy: Number,
      decisionMaking: Number,
      reactionTime: Number,
      strategyExecution: Number,
      teamwork: Number
    },
    chanceFactors: {
      randomSpawns: Number,
      weaponSpread: Number,
      criticalHits: Number,
      teamAssignment: Number,
      environmentalFactors: Number
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GameSession', gameSessionSchema); 