const mongoose = require('mongoose');

const gamingSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platformName: {
    type: String,
    required: true
  },
  gameName: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  breaks: [{
    startTime: Date,
    endTime: Date,
    duration: Number
  }],
  status: {
    type: String,
    enum: ['active', 'paused', 'completed'],
    default: 'active'
  }
});

module.exports = mongoose.model('GamingSession', gamingSessionSchema); 