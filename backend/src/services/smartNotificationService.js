const NotificationService = require('./notificationService');
const GamingSession = require('../models/GamingSession');
const TimeLimit = require('../models/TimeLimit');
const MoodTracker = require('../models/MoodTracker');

class SmartNotificationService {
  static async checkAndNotify(userId) {
    try {
      const session = await GamingSession.findOne({
        userId,
        status: 'active'
      });

      if (!session) return;

      const notifications = await this.analyzeSession(userId, session);
      
      for (const notification of notifications) {
        await NotificationService.createNotification(userId, notification);
      }
    } catch (error) {
      console.error('Smart notification error:', error);
    }
  }

  static async analyzeSession(userId, session) {
    const notifications = [];
    const currentTime = new Date();
    const sessionDuration = Math.round((currentTime - session.startTime) / 60000);
    const timeLimit = await TimeLimit.findOne({ userId });
    const moodData = await MoodTracker.findOne({ 
      userId, 
      sessionId: session._id 
    });

    // Duration-based notifications
    if (sessionDuration >= 120) { // 2 hours
      notifications.push({
        type: 'HEALTH_ALERT',
        title: 'Long Gaming Session',
        message: 'Consider taking a 15-minute break. You\'ve been playing for 2 hours.',
        priority: 'HIGH',
        actionRequired: true
      });
    }

    // Time of day notifications
    const hour = currentTime.getHours();
    if (hour >= 23 || hour < 6) {
      notifications.push({
        type: 'SLEEP_REMINDER',
        title: 'Late Night Gaming',
        message: 'It\'s getting late. Consider wrapping up your session for better sleep quality.',
        priority: 'MEDIUM'
      });
    }

    // Break compliance
    const lastBreak = session.breaks[session.breaks.length - 1];
    if (lastBreak) {
      const timeSinceBreak = Math.round((currentTime - lastBreak.endTime) / 60000);
      if (timeSinceBreak > timeLimit?.breakInterval) {
        notifications.push({
          type: 'BREAK_REMINDER',
          title: 'Break Time',
          message: `You haven't taken a break in ${timeSinceBreak} minutes.`,
          priority: 'HIGH',
          actionRequired: true
        });
      }
    }

    // Mood-based notifications
    if (moodData && moodData.impact === 'NEGATIVE') {
      notifications.push({
        type: 'MOOD_ALERT',
        title: 'Mood Check',
        message: 'Your gaming session seems to be affecting you negatively. Consider a break or switching activities.',
        priority: 'HIGH'
      });
    }

    return notifications;
  }
}

module.exports = SmartNotificationService; 