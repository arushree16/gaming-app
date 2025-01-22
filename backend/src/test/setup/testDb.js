const mongoose = require('mongoose');

// Disconnect from any existing connection
const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error disconnecting from MongoDB:', error);
    }
};

// Connect to test database
const connectDB = async () => {
    try {
        await disconnectDB();
        await mongoose.connect(process.env.TEST_MONGODB_URI || 'mongodb://localhost/test-db');
    } catch (error) {
        console.error('Error connecting to test database:', error);
        process.exit(1);
    }
};

module.exports = { connectDB, disconnectDB }; 