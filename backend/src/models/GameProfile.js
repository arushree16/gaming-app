const mongoose = require('mongoose');

const gameProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platforms: [{
    name: {
      type: String,
      enum: ['Steam', 'Epic Games', 'PlayStation', 'Xbox', 'Nintendo', 'Other'],
      required: true
    },
    username: String,
    games: [{
      name: String,
      totalPlaytime: Number, // in minutes
      lastPlayed: Date,
      favorite: Boolean
    }]
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GameProfile', gameProfileSchema);
