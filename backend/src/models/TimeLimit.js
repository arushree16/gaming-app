const mongoose = require('mongoose');

const timeLimitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dailyLimit: {
    type: Number, // in minutes
    default: 240  // 4 hours
  },
  weeklyLimit: {
    type: Number, // in minutes
    default: 1200 // 20 hours
  },
  breakInterval: {
    type: Number, // in minutes
    default: 60   // remind every hour
  },
  breakDuration: {
    type: Number, // in minutes
    default: 15   // 15-minute breaks
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    browser: {
      type: Boolean,
      default: true
    }
  }
});

module.exports = mongoose.model('TimeLimit', timeLimitSchema); 