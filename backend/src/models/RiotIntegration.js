const mongoose = require('mongoose');

const riotIntegrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  riotId: {
    type: String,
    required: true
  },
  gameName: String,
  tagLine: String,
  puuid: String,
  region: {
    type: String,
    enum: ['NA1', 'EUW1', 'KR', 'BR1', 'EUN1', 'LA1', 'LA2', 'OC1', 'TR1', 'RU'],
    required: true
  },
  lastChecked: {
    type: Date,
    default: Date.now
  },
  activeGame: {
    isPlaying: Boolean,
    gameType: String,
    startTime: Date
  }
});

module.exports = mongoose.model('RiotIntegration', riotIntegrationSchema); 