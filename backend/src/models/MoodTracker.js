const mongoose = require('mongoose');

const moodTrackerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GamingSession'
  },
  date: {
    type: Date,
    default: Date.now
  },
  mood: {
    before: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      notes: String
    },
    after: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      notes: String
    }
  },
  factors: [{
    type: String,
    enum: ['WINNING', 'LOSING', 'TEAM_CHAT', 'FATIGUE', 'ENJOYMENT', 'STRESS', 'SOCIAL']
  }],
  impact: {
    type: String,
    enum: ['POSITIVE', 'NEGATIVE', 'NEUTRAL']
  }
});

module.exports = mongoose.model('MoodTracker', moodTrackerSchema); 