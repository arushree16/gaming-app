const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const behaviorRoutes = require('./routes/behavior');
const fraudDetectionRoutes = require('./routes/fraudDetection');
const gameAnalysisRoutes = require('./routes/gameAnalysis');
const gameProfileRoutes = require('./routes/gameProfile');
const realTimeAnalysisRoutes = require('./routes/realTimeAnalysis');
const riotRoutes = require('./routes/riot');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(cors());
app.use(express.json());

// Use routes with correct paths
app.use('/api/auth', authRoutes);
app.use('/api/behavior', behaviorRoutes);
app.use('/api/fraud', fraudDetectionRoutes);
app.use('/api/game-analysis', gameAnalysisRoutes);
app.use('/api/game-profile', gameProfileRoutes);
app.use('/api/realtime', realTimeAnalysisRoutes);
app.use('/api/riot', riotRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: err.message 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Import your socket configuration
const socketConfig = require('./config/socket');
socketConfig.init(io);

// Import your services and routes AFTER initializing Socket.io
const RealTimeAnalysisService = require('./services/realTimeAnalysisService');

// Initialize your services AFTER Socket.io is initialized
const realTimeAnalysisService = new RealTimeAnalysisService();

mongoose.connect(process.env.TEST_MONGODB_URI || process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 