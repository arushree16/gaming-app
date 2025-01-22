const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const gameProfileRoutes = require('./routes/gameProfile');
const trackerRoutes = require('./routes/tracker');
const riotRoutes = require('./routes/riot');
const behaviorRoutes = require('./routes/behavior');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug: Print environment variables (remove in production)
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gaming', gameProfileRoutes);
app.use('/api/tracker', trackerRoutes);
app.use('/api/riot', riotRoutes);
app.use('/api/behavior', behaviorRoutes);

// Add middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Basic route to test the server
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// MongoDB connection with more detailed logging
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gaming-wellness';
console.log('MONGODB_URI:', MONGODB_URI);

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    console.log('Database:', mongoose.connection.db.databaseName);
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit if we can't connect to database
  });

// Try different ports if 5000 is busy
const PORT = process.env.PORT || 5001;

// Start server with error handling
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})
.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy, trying ${PORT + 1}`);
    app.listen(PORT + 1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
}); 