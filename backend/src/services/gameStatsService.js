const MatchHistory = require('../models/MatchHistory');
const GamingSession = require('../models/GamingSession');
const riotService = require('./riotService');

class GameStatsService {
  static async updateMatchHistory(userId, riotId, gameType) {
    try {
      let matches;
      if (gameType === 'Valorant') {
        matches = await riotService.getValorantMatches(riotId);
      } else {
        matches = await riotService.getLoLMatches(riotId);
      }

      for (const match of matches) {
        await this.processMatch(userId, match, gameType);
      }

      return await this.calculateStats(userId, gameType);
    } catch (error) {
      console.error('Error updating match history:', error);
      throw error;
    }
  }

  static async processMatch(userId, match, gameType) {
    const existingMatch = await MatchHistory.findOne({ matchId: match.matchId });
    if (existingMatch) return;

    const matchData = {
      userId,
      gameType,
      matchId: match.matchId,
      startTime: match.startTime,
      endTime: match.endTime,
      duration: match.duration,
      gameMode: match.gameMode,
      result: match.result,
      performance: this.extractPerformance(match, gameType)
    };

    await new MatchHistory(matchData).save();

    // Detect breaks between games
    await this.detectAndRecordBreak(userId, match.endTime);
  }

  static extractPerformance(match, gameType) {
    const common = {
      kills: match.kills,
      deaths: match.deaths,
      assists: match.assists,
      score: match.score
    };

    if (gameType === 'LeagueOfLegends') {
      return {
        ...common,
        championPlayed: match.champion,
        goldEarned: match.gold,
        cs: match.cs,
        vision: match.vision
      };
    } else {
      return {
        ...common,
        agent: match.agent,
        headshots: match.headshots,
        abilities: match.abilities
      };
    }
  }

  static async detectAndRecordBreak(userId, matchEndTime) {
    const nextMatch = await MatchHistory.findOne({
      userId,
      startTime: { $gt: matchEndTime }
    }).sort({ startTime: 1 });

    if (nextMatch) {
      const breakDuration = (nextMatch.startTime - matchEndTime) / 60000; // minutes
      if (breakDuration >= 15) { // Minimum break duration
        const session = await GamingSession.findOne({
          userId,
          status: 'active'
        });

        if (session) {
          session.breaks.push({
            startTime: matchEndTime,
            endTime: nextMatch.startTime,
            duration: breakDuration
          });
          await session.save();
        }
      }
    }
  }

  static async calculateStats(userId, gameType) {
    const matches = await MatchHistory.find({ userId, gameType });
    
    const stats = {
      totalGames: matches.length,
      wins: matches.filter(m => m.result === 'WIN').length,
      losses: matches.filter(m => m.result === 'LOSS').length,
      averageKDA: this.calculateAverageKDA(matches),
      totalPlayTime: matches.reduce((sum, m) => sum + m.duration, 0),
      recentPerformance: matches.slice(-5), // Last 5 games
    };

    if (gameType === 'LeagueOfLegends') {
      stats.averageCS = this.calculateAverageCS(matches);
      stats.mostPlayedChampions = this.getMostPlayed(matches, 'championPlayed');
    } else {
      stats.averageHeadshots = this.calculateAverageHeadshots(matches);
      stats.mostPlayedAgents = this.getMostPlayed(matches, 'agent');
    }

    return stats;
  }

  static calculateAverageKDA(matches) {
    return matches.reduce((sum, match) => ({
      kills: sum.kills + match.performance.kills,
      deaths: sum.deaths + match.performance.deaths,
      assists: sum.assists + match.performance.assists
    }), { kills: 0, deaths: 0, assists: 0 });
  }

  static getMostPlayed(matches, field) {
    const counts = {};
    matches.forEach(match => {
      const value = match.performance[field];
      counts[value] = (counts[value] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  }
}

module.exports = GameStatsService; 