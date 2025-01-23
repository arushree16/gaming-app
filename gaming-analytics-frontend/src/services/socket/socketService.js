import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000', {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  subscribeToGameUpdates(callback) {
    this.socket.on('gameUpdate', callback);
  }

  subscribeToBehaviorUpdates(callback) {
    this.socket.on('behaviorUpdate', callback);
  }
}

export default new SocketService(); 