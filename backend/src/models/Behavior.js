const mongoose = require('mongoose');

const behaviorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GamingSession'
  },
  type: {
    type: String,
    enum: ['CHAT', 'VOICE', 'GAMEPLAY', 'REPORT'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  toxicityScore: {
    type: Number,
    min: 0,
    max: 1
  },
  categories: [{
    type: String,
    enum: ['TOXIC', 'HARASSMENT', 'HATE_SPEECH', 'THREAT', 'SPAM', 'CLEAN', 'INAPPROPRIATE', 'INSULT', 'PROFANITY'],
    default: ['CLEAN']
  }],
  timestamp: {
    type: Date,
    default: Date.now
  },
  context: {
    gameType: String,
    matchId: String,
    reportedBy: String
  },
  action: {
    type: String,
    enum: ['WARNING', 'MUTE', 'TIMEOUT', 'BAN', 'NONE'],
    default: 'NONE'
  }
});

module.exports = mongoose.model('Behavior', behaviorSchema); 