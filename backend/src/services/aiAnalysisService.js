const axios = require('axios');
const Behavior = require('../models/Behavior');
const NotificationService = require('./notificationService');

class AIAnalysisService {
  static async analyzeBehavior(userId, data) {
    try {
      // Get toxicity analysis from Perspective API
      const toxicityResult = await this.analyzeWithPerspective(data.content);
      
      // Create behavior record
      const behavior = new Behavior({
        userId,
        sessionId: data.sessionId,
        type: data.type,
        content: data.content,
        toxicityScore: toxicityResult.toxicity,
        categories: this.getCategories(toxicityResult),
        context: {
          ...data.context,
          aiAnalysis: toxicityResult
        }
      });

      // Determine action based on toxicity
      behavior.action = this.determineAction(toxicityResult);
      await behavior.save();

      // Send notification if needed
      if (behavior.action !== 'NONE') {
        await NotificationService.createNotification(userId, {
          type: 'BEHAVIOR',
          title: 'Behavior Alert',
          message: this.getActionMessage(behavior.action, toxicityResult),
          priority: behavior.action === 'BAN' ? 'HIGH' : 'MEDIUM',
          actionRequired: true,
          metadata: {
            analysis: toxicityResult
          }
        });
      }

      return behavior;
    } catch (error) {
      console.error('AI Analysis Error:', error);
      throw error;
    }
  }

  static async analyzeWithPerspective(text) {
    try {
      const response = await axios.post(
        `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${process.env.PERSPECTIVE_API_KEY}`,
        {
          comment: { text },
          languages: ['en'],
          requestedAttributes: {
            TOXICITY: {},
            SEVERE_TOXICITY: {},
            IDENTITY_ATTACK: {},
            INSULT: {},
            PROFANITY: {},
            THREAT: {}
          }
        }
      );

      const scores = response.data.attributeScores;
      
      // Properly access the nested summaryScore values
      return {
        toxicity: scores.TOXICITY.summaryScore.value,
        severeToxicity: scores.SEVERE_TOXICITY.summaryScore.value,
        identityAttack: scores.IDENTITY_ATTACK.summaryScore.value,
        insult: scores.INSULT.summaryScore.value,
        profanity: scores.PROFANITY.summaryScore.value,
        threat: scores.THREAT.summaryScore.value
      };
    } catch (error) {
      // Add better error handling
      if (error.response) {
        console.error('Perspective API Error Response:', error.response.data);
        throw new Error(`Perspective API Error: ${error.response.data.error?.message || 'Unknown error'}`);
      }
      throw error;
    }
  }

  static getCategories(toxicityResult) {
    const categories = [];
    if (toxicityResult.toxicity > 0.7) categories.push('TOXIC');
    if (toxicityResult.identityAttack > 0.7) categories.push('HATE_SPEECH');
    if (toxicityResult.threat > 0.7) categories.push('THREAT');
    if (toxicityResult.profanity > 0.7) categories.push('INAPPROPRIATE');
    if (categories.length === 0) categories.push('CLEAN');
    return categories;
  }

  static determineAction(toxicityResult) {
    if (toxicityResult.severeToxicity > 0.8 || toxicityResult.threat > 0.8) {
      return 'BAN';
    }
    if (toxicityResult.toxicity > 0.7 || toxicityResult.identityAttack > 0.7) {
      return 'TIMEOUT';
    }
    if (toxicityResult.toxicity > 0.5 || toxicityResult.insult > 0.6) {
      return 'WARNING';
    }
    return 'NONE';
  }

  static getActionMessage(action, toxicityResult) {
    const messages = {
      BAN: 'Your message severely violated our community guidelines. Your account has been banned.',
      TIMEOUT: 'Due to toxic behavior, you have received a temporary timeout.',
      WARNING: 'Please maintain respectful communication. This is a warning.',
      NONE: 'Keep up the positive communication!'
    };

    return messages[action];
  }

  // Get behavior report
  static async getBehaviorReport(userId) {
    const behaviors = await Behavior.find({ userId })
      .sort({ timestamp: -1 })
      .limit(100);

    return {
      overallScore: this.calculateOverallScore(behaviors),
      recentIncidents: behaviors.length,
      improvements: this.calculateImprovements(behaviors),
      recommendations: this.generateRecommendations(behaviors)
    };
  }

  // Calculate overall behavior score
  static calculateOverallScore(behaviors) {
    if (!behaviors.length) return 100;
    const avgToxicity = behaviors.reduce((sum, b) => sum + b.toxicityScore, 0) / behaviors.length;
    return Math.round((1 - avgToxicity) * 100);
  }

  // Calculate improvements
  static calculateImprovements(behaviors) {
    if (behaviors.length < 2) return [];
    
    const recent = behaviors.slice(0, 10);
    const past = behaviors.slice(10);
    
    if (!past.length) return [];

    const recentAvg = recent.reduce((sum, b) => sum + b.toxicityScore, 0) / recent.length;
    const pastAvg = past.reduce((sum, b) => sum + b.toxicityScore, 0) / past.length;

    return recentAvg < pastAvg ? ['Improved communication tone', 'Reduced toxic incidents'] : [];
  }

  // Generate recommendations
  static generateRecommendations(behaviors) {
    if (!behaviors.length) return ['Keep maintaining positive communication!'];
    
    const recommendations = [];
    const recentToxicity = behaviors[0].toxicityScore;

    if (recentToxicity > 0.6) {
      recommendations.push('Consider taking breaks when feeling frustrated');
      recommendations.push('Try using more constructive language');
    } else if (recentToxicity > 0.3) {
      recommendations.push('Your communication could be more positive');
    } else {
      recommendations.push('Great job maintaining positive communication!');
    }

    return recommendations;
  }
}

module.exports = AIAnalysisService; 