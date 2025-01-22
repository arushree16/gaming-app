const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: String,
  description: String,
  type: {
    type: String,
    enum: ['HEALTH', 'BREAK', 'BALANCE', 'IMPROVEMENT'],
    required: true
  },
  criteria: {
    type: String,
    required: true
  },
  progress: {
    current: Number,
    target: Number,
    percentage: Number
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  rewards: [String],
  icon: String
});

module.exports = mongoose.model('Achievement', achievementSchema); 