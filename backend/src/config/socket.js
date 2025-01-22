let io;

const init = (httpServer) => {
    io = require('socket.io')(httpServer);
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

module.exports = {
    init,
    getIO,
}; 