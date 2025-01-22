const GameAnalysisService = require('./gameAnalysisService');
const { getIO } = require('../config/socket');

class RealTimeAnalysisService {
    constructor() {
        this.activeGames = new Map(); // Store active game sessions
        this.analysisInterval = 5000;  // Analyze every 5 seconds
        this.gameAnalysisService = new GameAnalysisService();
        this.io = getIO(); // Ensure this is called after Socket.io is initialized
    }

    async startGameAnalysis(gameId, gameType, userId) {
        try {
            // Initialize game session data
            this.activeGames.set(gameId, {
                gameType,
                userId,
                startTime: Date.now(),
                events: [],
                currentAnalysis: null,
                analysisHistory: [],
                intervalId: null
            });

            // Start periodic analysis
            const intervalId = setInterval(() => {
                this.analyzeGameplay(gameId);
            }, this.analysisInterval);

            this.activeGames.get(gameId).intervalId = intervalId;

            return { message: 'Real-time analysis started', gameId };
        } catch (error) {
            console.error('Error starting game analysis:', error);
            throw error;
        }
    }

    async addGameEvent(gameId, event) {
        try {
            const gameSession = this.activeGames.get(gameId);
            if (!gameSession) {
                throw new Error('Game session not found');
            }

            // Add timestamp to event
            event.timestamp = Date.now();
            gameSession.events.push(event);

            // Trigger immediate analysis if it's a significant event
            if (this.isSignificantEvent(event)) {
                await this.analyzeGameplay(gameId);
            }
        } catch (error) {
            console.error('Error adding game event:', error);
            throw error;
        }
    }

    isSignificantEvent(event) {
        const significantTypes = [
            'critical_hit',
            'objective_capture',
            'team_wipe',
            'ace',
            'clutch'
        ];
        return significantTypes.includes(event.type);
    }

    async analyzeGameplay(gameId) {
        try {
            const gameSession = this.activeGames.get(gameId);
            if (!gameSession) return;

            // Prepare analysis data
            const analysisData = {
                matchId: gameId,
                gameType: gameSession.gameType,
                playerStats: this.calculatePlayerStats(gameSession.events),
                playerActions: this.filterEventsByType(gameSession.events, 'player_action'),
                combatEvents: this.filterEventsByType(gameSession.events, 'combat'),
                strategicActions: this.filterEventsByType(gameSession.events, 'strategic'),
                teamEvents: this.filterEventsByType(gameSession.events, 'team'),
                environmentEvents: this.filterEventsByType(gameSession.events, 'environment')
            };

            // Perform analysis
            const analysis = await this.gameAnalysisService.analyze(analysisData);
            
            // Update session with new analysis
            gameSession.currentAnalysis = analysis;
            gameSession.analysisHistory.push({
                timestamp: Date.now(),
                analysis
            });

            // Emit analysis results
            this.emitAnalysisUpdate(gameId, analysis);

            return analysis;
        } catch (error) {
            console.error('Error analyzing gameplay:', error);
            throw error;
        }
    }

    calculatePlayerStats(events) {
        const stats = {
            shots: 0,
            hits: 0,
            accuracy: 0,
            kills: 0,
            deaths: 0,
            assists: 0
        };

        events.forEach(event => {
            if (event.type === 'shot') {
                stats.shots++;
                if (event.hit) stats.hits++;
            }
            if (event.type === 'kill') stats.kills++;
            if (event.type === 'death') stats.deaths++;
            if (event.type === 'assist') stats.assists++;
        });

        stats.accuracy = stats.shots > 0 ? (stats.hits / stats.shots) * 100 : 0;
        return stats;
    }

    filterEventsByType(events, type) {
        return events.filter(event => event.category === type);
    }

    emitAnalysisUpdate(gameId, analysis) {
        if (this.io && process.env.NODE_ENV !== 'test') {
            this.io.emit('analysis-update', {
                gameId,
                timestamp: Date.now(),
                analysis
            });
        }
    }

    async endGameAnalysis(gameId) {
        try {
            const gameSession = this.activeGames.get(gameId);
            if (!gameSession) return;

            // Clear analysis interval
            clearInterval(gameSession.intervalId);

            // Perform final analysis
            const finalAnalysis = await this.analyzeGameplay(gameId);

            // Store final analysis in database
            await this.storeFinalAnalysis(gameId, finalAnalysis);

            // Clean up
            this.activeGames.delete(gameId);

            return finalAnalysis;
        } catch (error) {
            console.error('Error ending game analysis:', error);
            throw error;
        }
    }

    async storeFinalAnalysis(gameId, analysis) {
        // Store in database
        const GameSession = require('../models/GameSession');
        await GameSession.findOneAndUpdate(
            { matchId: gameId },
            { 
                $set: { 
                    skillAnalysis: analysis,
                    endTime: Date.now()
                }
            },
            { upsert: true }
        );
    }

    getGameAnalysis(gameId) {
        const gameSession = this.activeGames.get(gameId);
        return gameSession ? gameSession.currentAnalysis : null;
    }

    getAnalysisHistory(gameId) {
        const gameSession = this.activeGames.get(gameId);
        return gameSession ? gameSession.analysisHistory : [];
    }
}

module.exports = RealTimeAnalysisService; 