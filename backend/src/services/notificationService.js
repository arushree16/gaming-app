const mongoose = require('mongoose');
const Notification = require('../models/Notification');

class NotificationService {
  static async createNotification(userId, data) {
    try {
      const notification = new Notification({
        userId,
        type: data.type,
        title: data.title,
        message: data.message,
        priority: data.priority || 'MEDIUM',
        actionRequired: data.actionRequired || false,
        metadata: data.metadata || {}
      });

      await notification.save();
      
      // If you have WebSocket set up, emit the notification
      if (global.io) {
        global.io.to(userId.toString()).emit('notification', notification);
      }

      return notification;
    } catch (error) {
      console.error('Notification creation error:', error);
      throw error;
    }
  }

  static async getUnreadNotifications(userId) {
    return Notification.find({
      userId,
      read: false
    }).sort({ createdAt: -1 });
  }

  static async markAsRead(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true },
      { new: true }
    );
  }
}

module.exports = NotificationService; 