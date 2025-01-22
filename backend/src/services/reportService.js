const GamingSession = require('../models/GamingSession');
const MoodTracker = require('../models/MoodTracker');
const Achievement = require('../models/Achievement');

class ReportService {
  static async generateWeeklyReport(userId) {
    const endDate = new Date();
    const startDate = new Date(endDate - 7 * 24 * 60 * 60 * 1000);

    const [sessions, moods, achievements] = await Promise.all([
      this.getWeekSessions(userId, startDate, endDate),
      this.getWeekMoods(userId, startDate, endDate),
      this.getWeekAchievements(userId, startDate, endDate)
    ]);

    const report = {
      period: {
        start: startDate,
        end: endDate
      },
      summary: await this.generateSummary(sessions),
      healthMetrics: await this.calculateHealthMetrics(sessions),
      moodAnalysis: this.analyzeMoods(moods),
      achievements: this.formatAchievements(achievements),
      recommendations: await this.generateRecommendations(sessions, moods)
    };

    return report;
  }

  static async getWeekSessions(userId, startDate, endDate) {
    return GamingSession.find({
      userId,
      startTime: { $gte: startDate, $lte: endDate }
    });
  }

  static async generateSummary(sessions) {
    const totalPlaytime = sessions.reduce((sum, session) => sum + session.duration, 0);
    const gamesPlayed = sessions.reduce((games, session) => {
      games[session.gameName] = (games[session.gameName] || 0) + 1;
      return games;
    }, {});

    return {
      totalPlaytime,
      sessionsCount: sessions.length,
      mostPlayedGame: Object.entries(gamesPlayed)
        .sort(([,a], [,b]) => b - a)[0]?.[0],
      averageSessionLength: totalPlaytime / sessions.length || 0
    };
  }

  static async calculateHealthMetrics(sessions) {
    const breakCompliance = sessions.reduce((sum, session) => {
      const expectedBreaks = Math.floor(session.duration / 60);
      const actualBreaks = session.breaks.length;
      return sum + (actualBreaks / expectedBreaks || 0);
    }, 0) / sessions.length;

    return {
      breakCompliance: Math.round(breakCompliance * 100),
      eyeStrain: this.calculateEyeStrainRisk(sessions),
      posture: this.calculatePostureRisk(sessions),
      sleepImpact: this.calculateSleepImpact(sessions)
    };
  }

  static analyzeMoods(moods) {
    const moodScores = moods.map(mood => ({
      before: mood.mood.before.rating,
      after: mood.mood.after.rating,
      impact: mood.impact
    }));

    return {
      averageMoodChange: this.calculateAverageMoodChange(moodScores),
      commonFactors: this.getCommonMoodFactors(moods),
      trendAnalysis: this.analyzeMoodTrends(moodScores)
    };
  }

  static async generateRecommendations(sessions, moods) {
    const recommendations = [];

    // Break-related recommendations
    const breakCompliance = await this.calculateBreakCompliance(sessions);
    if (breakCompliance < 0.7) {
      recommendations.push({
        type: 'BREAK',
        message: 'Try setting break reminders every hour',
        priority: 'HIGH'
      });
    }

    // Session length recommendations
    const avgSessionLength = this.calculateAverageSessionLength(sessions);
    if (avgSessionLength > 180) { // 3 hours
      recommendations.push({
        type: 'HEALTH',
        message: 'Consider shorter gaming sessions',
        priority: 'MEDIUM'
      });
    }

    // Mood-based recommendations
    const moodImpact = this.analyzeMoodImpact(moods);
    if (moodImpact.negative > moodImpact.positive) {
      recommendations.push({
        type: 'WELLNESS',
        message: 'Your gaming sessions might be affecting your mood. Consider mixing in other activities.',
        priority: 'HIGH'
      });
    }

    return recommendations;
  }
}

module.exports = ReportService; 