const mongoose = require('mongoose');
const GameAnalysisService = require('../services/gameAnalysisService');

class GameAnalysisTest {
    static async connectDB() {
        try {
            await mongoose.connect('mongodb://localhost:27017/gaming-app', {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('Connected to MongoDB for testing');
        } catch (error) {
            console.error('MongoDB Connection Error:', error);
            process.exit(1);
        }
    }

    static async testPureSkillScenario() {
        console.log('\nTesting Pure Skill Scenario:');
        
        const testData = {
            matchId: 'test_skill_1',
            gameType: 'CS:GO',
            playerStats: {
                shots: 100,
                hits: 95  // 95% accuracy
            },
            playerActions: [
                { type: 'objective_capture', success: true },
                { type: 'rotation', success: true }
            ],
            combatEvents: [
                { responseTime: 150, isCritical: false },
                { responseTime: 160, isCritical: false }
            ],
            strategicActions: [
                { type: 'site_execute', success: true }
            ],
            teamEvents: [
                { type: 'trade_kill', success: true }
            ]
        };

        const analysis = await GameAnalysisService.analyzeGameOutcome(testData);
        console.log('Skill Percentage:', analysis.skillPercentage);
        console.log('Expected: >80%, Actual:', analysis.skillPercentage);
        console.log('Test Result:', analysis.skillPercentage > 80 ? 'PASSED' : 'FAILED');
    }

    static async testPureChanceScenario() {
        console.log('\nTesting Pure Chance Scenario:');
        
        const testData = {
            matchId: 'test_chance_1',
            gameType: 'Poker',
            playerStats: {
                hands: 10,
                randomWins: 8
            },
            environmentEvents: [
                { type: 'card_shuffle', impact: 'high' },
                { type: 'dealer_action', impact: 'high' }
            ],
            combatEvents: [], // No combat in poker
            playerActions: [
                { type: 'card_draw', success: true, random: true },
                { type: 'card_draw', success: true, random: true }
            ],
            spawnEvents: [
                { location: 'random_seat_1', random: true },
                { location: 'random_seat_2', random: true }
            ],
            teams: {
                team1: { averageRank: 'Gold', players: 1 },
                team2: { averageRank: 'Gold', players: 1 }
            }
        };

        const analysis = await GameAnalysisService.analyzeGameOutcome(testData);
        console.log('Chance Percentage:', analysis.chancePercentage);
        console.log('Expected: >60%, Actual:', analysis.chancePercentage);
        console.log('Test Result:', analysis.chancePercentage > 60 ? 'PASSED' : 'FAILED');
    }

    static async testMixedScenario() {
        console.log('\nTesting Mixed Scenario:');
        
        const testData = {
            matchId: 'test_mixed_1',
            gameType: 'Hearthstone',
            playerStats: {
                decisions: 20,
                optimalPlays: 15,
                randomOutcomes: 10
            },
            environmentEvents: [
                { type: 'card_draw', impact: 'high' },
                { type: 'random_effect', impact: 'medium' }
            ],
            playerActions: [
                { type: 'card_play', success: true },
                { type: 'strategic_decision', success: true }
            ],
            spawnEvents: [
                { location: 'random_card_1', random: true },
                { location: 'random_card_2', random: true }
            ]
        };

        const analysis = await GameAnalysisService.analyzeGameOutcome(testData);
        console.log('Skill/Chance Balance:');
        console.log('Skill:', analysis.skillPercentage);
        console.log('Chance:', analysis.chancePercentage);
        console.log('Test Result:', 
            Math.abs(analysis.skillPercentage - analysis.chancePercentage) < 30 
            ? 'PASSED' : 'FAILED');
    }

    static async testCrossGameComparison() {
        console.log('\nTesting Cross-Game Comparison:');
        
        const games = ['Valorant', 'Poker', 'Hearthstone'];
        const results = {};

        for (const game of games) {
            const testData = {
                matchId: `test_${game.toLowerCase()}_1`,
                gameType: game,
                // Add minimal required data for each game
                playerStats: { shots: 100, hits: 70 },
                environmentEvents: [{ type: 'test', impact: 'medium' }]
            };
            
            const analysis = await GameAnalysisService.analyzeGameOutcome(testData);
            results[game] = {
                skillPercentage: analysis.skillPercentage,
                chancePercentage: analysis.chancePercentage
            };
        }

        console.log('Cross-Game Analysis Results:');
        console.log(JSON.stringify(results, null, 2));
        
        // Verify expected relationships
        console.log('Test Result:', 
            results.Valorant.skillPercentage > results.Poker.skillPercentage &&
            results.Poker.chancePercentage > results.Valorant.chancePercentage
            ? 'PASSED' : 'FAILED');
    }

    static async testEdgeCases() {
        console.log('\nTesting Edge Cases:');
        
        // Test extremely high skill
        const highSkillData = {
            matchId: 'test_edge_1',
            gameType: 'CS:GO',
            playerStats: {
                shots: 100,
                hits: 100  // Perfect accuracy
            },
            combatEvents: [
                { responseTime: 100, isCritical: false } // Perfect reaction time
            ],
            playerActions: [
                { type: 'perfect_play', success: true }
            ]
        };

        // Test extremely high chance
        const highChanceData = {
            matchId: 'test_edge_2',
            gameType: 'Poker',
            playerStats: {
                hands: 10,
                randomWins: 10  // All random
            },
            environmentEvents: [
                { type: 'pure_luck', impact: 'high' },
                { type: 'pure_luck', impact: 'high' }
            ],
            spawnEvents: [
                { location: 'random', random: true },
                { location: 'random', random: true }
            ]
        };

        const highSkillAnalysis = await GameAnalysisService.analyzeGameOutcome(highSkillData);
        const highChanceAnalysis = await GameAnalysisService.analyzeGameOutcome(highChanceData);

        console.log('Edge Case Results:');
        console.log('High Skill:', highSkillAnalysis.skillPercentage);
        console.log('High Chance:', highChanceAnalysis.chancePercentage);
        console.log('Test Result:', 
            highSkillAnalysis.skillPercentage > 90 &&
            highChanceAnalysis.chancePercentage > 90
            ? 'PASSED' : 'FAILED');
    }

    static async runAccuracyTests() {
        try {
            await this.connectDB();
            
            console.log('Starting Game Analysis Accuracy Tests...\n');

            await this.testPureSkillScenario();
            await this.testPureChanceScenario();
            await this.testMixedScenario();
            await this.testCrossGameComparison();
            await this.testEdgeCases();

            console.log('\nAll tests completed!');
            
            await mongoose.connection.close();
            console.log('Closed MongoDB connection');
            
        } catch (error) {
            console.error('Test Error:', error);
            await mongoose.connection.close();
        }
    }
}

// Run the tests
GameAnalysisTest.runAccuracyTests();

module.exports = GameAnalysisTest; 