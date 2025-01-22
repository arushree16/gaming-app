const mongoose = require('mongoose');
const GameSession = require('../models/GameSession');

class GameAnalysisService {
  static async analyzeGameOutcome(matchData) {
    try {
      // Get base game metrics
      const baseMetrics = await this.getGameMetrics(matchData.gameType);
      
      // Calculate skill and chance factors with base metrics influence
      const skillFactors = this.calculateSkillFactors(matchData, baseMetrics);
      const chanceFactors = this.calculateChanceFactors(matchData, baseMetrics);
      
      // Determine the overall ratio with improved accuracy
      return this.determineSkillChanceRatio(skillFactors, chanceFactors, baseMetrics);
    } catch (error) {
      console.error('Game Analysis Error:', error);
      throw error;
    }
  }

  static calculateSkillFactors(matchData, baseMetrics) {
    const rawSkillFactors = {
      aimAccuracy: matchData.playerStats?.shots ? 
        (matchData.playerStats.hits / matchData.playerStats.shots) * 100 : 0,
      decisionMaking: matchData.playerActions ? 
        this.evaluateDecisions(matchData.playerActions) : 0,
      reactionTime: matchData.combatEvents ? 
        this.normalizeReactionTime(this.calculateReactionTime(matchData.combatEvents)) : 0,
      strategyExecution: matchData.strategicActions ? 
        this.evaluateStrategySuccess(matchData.strategicActions) : 0,
      teamwork: matchData.teamEvents ? 
        this.evaluateTeamwork(matchData.teamEvents) : 0
    };

    // Apply base metrics influence
    if (baseMetrics) {
      return {
        aimAccuracy: rawSkillFactors.aimAccuracy * baseMetrics.mechanicalRequirements,
        decisionMaking: rawSkillFactors.decisionMaking * baseMetrics.strategyDepth,
        reactionTime: rawSkillFactors.reactionTime * baseMetrics.mechanicalRequirements,
        strategyExecution: rawSkillFactors.strategyExecution * baseMetrics.strategyDepth,
        teamwork: rawSkillFactors.teamwork * baseMetrics.teamworkImportance
      };
    }

    return rawSkillFactors;
  }

  static calculateChanceFactors(matchData, baseMetrics) {
    const rawChanceFactors = {
      randomSpawns: matchData.spawnEvents ? 
        this.calculateRandomnessScore(matchData.spawnEvents) : 0,
      weaponSpread: matchData.combatEvents ? 
        this.calculateSpreadImpact(matchData.combatEvents) : 0,
      criticalHits: matchData.combatEvents ? 
        this.calculateCriticalImpact(matchData.combatEvents.filter(e => e.isCritical)) : 0,
      teamAssignment: matchData.teams ? 
        this.calculateTeamBalanceScore(matchData.teams) : 0,
      environmentalFactors: matchData.environmentEvents ? 
        this.calculateEnvironmentalImpact(matchData.environmentEvents) : 0
    };

    // Apply base metrics influence
    if (baseMetrics) {
      const baseRandomness = baseMetrics.randomElements;
      return {
        randomSpawns: rawChanceFactors.randomSpawns * baseRandomness,
        weaponSpread: rawChanceFactors.weaponSpread * baseRandomness,
        criticalHits: rawChanceFactors.criticalHits * baseRandomness,
        teamAssignment: rawChanceFactors.teamAssignment * baseRandomness,
        environmentalFactors: rawChanceFactors.environmentalFactors * baseRandomness
      };
    }

    return rawChanceFactors;
  }

  static normalizeReactionTime(reactionTime) {
    // Convert reaction time to a 0-100 scale
    // Assuming: 100ms = 100%, 500ms = 0%
    const MAX_REACTION = 500;
    const MIN_REACTION = 100;
    
    if (!reactionTime) return 0;
    if (reactionTime <= MIN_REACTION) return 100;
    if (reactionTime >= MAX_REACTION) return 0;
    
    return ((MAX_REACTION - reactionTime) / (MAX_REACTION - MIN_REACTION)) * 100;
  }

  static calculateWeightedSkillScore(skillFactors, baseMetrics) {
    // Dynamic weights based on game type
    const weights = baseMetrics ? {
      aimAccuracy: baseMetrics.mechanicalRequirements * 0.3,
      decisionMaking: baseMetrics.strategyDepth * 0.25,
      reactionTime: baseMetrics.mechanicalRequirements * 0.2,
      strategyExecution: baseMetrics.strategyDepth * 0.15,
      teamwork: baseMetrics.teamworkImportance * 0.1
    } : {
      aimAccuracy: 0.25,
      decisionMaking: 0.2,
      reactionTime: 0.2,
      strategyExecution: 0.2,
      teamwork: 0.15
    };

    let weightedScore = 0;
    for (const [factor, weight] of Object.entries(weights)) {
      weightedScore += (skillFactors[factor] || 0) * weight;
    }

    return Math.min(100, Math.max(0, weightedScore));
  }

  static calculateWeightedChanceScore(chanceFactors, baseMetrics) {
    // Dynamic weights based on game type
    const weights = baseMetrics ? {
      randomSpawns: baseMetrics.randomElements * 0.25,
      weaponSpread: baseMetrics.randomElements * 0.25,
      criticalHits: baseMetrics.randomElements * 0.2,
      teamAssignment: baseMetrics.randomElements * 0.15,
      environmentalFactors: baseMetrics.randomElements * 0.15
    } : {
      randomSpawns: 0.2,
      weaponSpread: 0.25,
      criticalHits: 0.25,
      teamAssignment: 0.15,
      environmentalFactors: 0.15
    };

    let weightedScore = 0;
    for (const [factor, weight] of Object.entries(weights)) {
      weightedScore += (chanceFactors[factor] || 0) * weight;
    }

    return Math.min(100, Math.max(0, weightedScore));
  }

  static determineSkillChanceRatio(skillFactors, chanceFactors, baseMetrics) {
    // Calculate weighted scores with base metrics influence
    const skillScore = this.calculateWeightedSkillScore(skillFactors, baseMetrics);
    const chanceScore = this.calculateWeightedChanceScore(chanceFactors, baseMetrics);
    
    // Apply game-specific adjustments
    const totalScore = skillScore + chanceScore;
    if (totalScore === 0) {
      return {
        skillPercentage: 50,
        chancePercentage: 50,
        skillFactors,
        chanceFactors,
        classification: 'MIXED',
        confidence: 0
      };
    }

    // Normalize percentages to ensure they add up to 100
    const skillPercentage = Math.round((skillScore / totalScore) * 100);
    const chancePercentage = Math.round((chanceScore / totalScore) * 100);

    return {
      skillPercentage,
      chancePercentage,
      skillFactors,
      chanceFactors,
      classification: this.classifyGame(skillPercentage),
      confidence: this.calculateConfidence(skillScore, chanceScore)
    };
  }

  static classifyGame(skillPercentage) {
    if (skillPercentage >= 70) return 'SKILL_BASED';
    if (skillPercentage <= 30) return 'CHANCE_BASED';
    return 'MIXED';
  }

  static calculateConfidence(skillScore, chanceScore) {
    if (skillScore === 0 && chanceScore === 0) return 0;
    
    const totalScore = skillScore + chanceScore;
    if (totalScore === 0) return 0;

    const dominantFactor = Math.max(skillScore, chanceScore);
    const confidence = (dominantFactor / totalScore) * 100;
    
    // Higher confidence when scores are more polarized
    const scoreDifference = Math.abs(skillScore - chanceScore);
    const polarizationBonus = (scoreDifference / totalScore) * 20;
    
    return Math.min(100, Math.max(0, confidence + polarizationBonus));
  }

  // Helper methods for skill calculations
  static calculateAimAccuracy(matchData) {
    const { shots, hits } = matchData.playerStats;
    return (hits / shots) * 100;
  }

  static calculateDecisionScore(matchData) {
    // Analyze decision points like:
    // - Objective captures
    // - Rotations
    // - Resource management
    const decisions = matchData.playerActions.filter(action => 
      ['objective_capture', 'rotation', 'resource_usage'].includes(action.type)
    );
    
    return this.evaluateDecisions(decisions);
  }

  static calculateReactionTime(events) {
    if (!events || !Array.isArray(events) || events.length === 0) return 0;
    const times = events.map(event => event.responseTime || 0);
    return this.calculateAverage(times);
  }

  static calculateStrategyScore(matchData) {
    // Evaluate strategic choices and their outcomes
    return this.evaluateStrategySuccess(matchData.strategicActions);
  }

  static calculateTeamworkScore(matchData) {
    // Analyze team coordination events
    const teamworkEvents = matchData.teamEvents;
    return this.evaluateTeamwork(teamworkEvents);
  }

  // Helper methods for chance calculations
  static analyzeSpawnPatterns(matchData) {
    // Analyze randomness in spawn locations
    return this.calculateRandomnessScore(matchData.spawnEvents);
  }

  static analyzeWeaponSpread(matchData) {
    // Calculate weapon spread RNG impact
    return this.calculateSpreadImpact(matchData.combatEvents);
  }

  static analyzeCriticalHits(matchData) {
    // Analyze critical hit occurrences
    const criticalHits = matchData.combatEvents.filter(event => event.isCritical);
    return this.calculateCriticalImpact(criticalHits);
  }

  static analyzeTeamBalance(matchData) {
    // Analyze team matchmaking randomness
    return this.calculateTeamBalanceScore(matchData.teams);
  }

  static analyzeEnvironmental(matchData) {
    // Analyze random environmental factors
    return this.calculateEnvironmentalImpact(matchData.environmentEvents);
  }

  static async storeAnalysis(matchId, analysis) {
    // Store the analysis results in the database
    await GameSession.findOneAndUpdate(
      { matchId },
      { 
        $set: { 
          skillAnalysis: analysis 
        }
      },
      { new: true }
    );
  }

  // Add this new method for pre-game analysis
  static async analyzeGameType(gameType) {
    try {
      // Analyze game mechanics and rules
      const gameMetrics = await this.getGameMetrics(gameType);
      
      return {
        gameType,
        baseSkillFactors: {
          mechanicalSkill: this.analyzeMechanics(gameMetrics),
          strategicDepth: this.analyzeStrategy(gameMetrics),
          teamworkRequirement: this.analyzeTeamwork(gameMetrics),
          learningCurve: this.analyzeLearningCurve(gameMetrics)
        },
        baseChanceFactors: {
          randomElements: this.analyzeRandomness(gameMetrics),
          luckBasedMechanics: this.analyzeLuckMechanics(gameMetrics),
          environmentalRNG: this.analyzeEnvironmental(gameMetrics)
        },
        classification: this.getBaseClassification(gameMetrics),
        recommendedSkills: this.getRecommendedSkills(gameMetrics)
      };
    } catch (error) {
      console.error('Game Type Analysis Error:', error);
      throw error;
    }
  }

  static async getGameMetrics(gameType) {
    const gameMetrics = {
      'Valorant': {
        mechanicalRequirements: 0.9,    // High mechanical skill (aim, movement)
        strategyDepth: 0.85,            // Complex strategies and tactics
        teamworkImportance: 0.8,        // Team coordination crucial
        randomElements: 0.2,            // Low RNG (mostly spray patterns)
        learningCurve: 0.85,            // Steep learning curve
        skillFactors: {
          aimPrecision: 0.95,
          movementControl: 0.85,
          utilityUsage: 0.8,
          mapKnowledge: 0.85,
          economyManagement: 0.7
        },
        chanceFactors: {
          sprayPatterns: 0.3,
          spawns: 0.1,
          teamAssignment: 0.2
        }
      },

      'League of Legends': {
        mechanicalRequirements: 0.8,    // High mechanical skill
        strategyDepth: 0.9,             // Very high strategic depth
        teamworkImportance: 0.85,       // Heavy team dependency
        randomElements: 0.3,            // Some RNG (dragons, crits)
        learningCurve: 0.9,             // Very steep learning curve
        skillFactors: {
          champMechanics: 0.9,
          farming: 0.85,
          mapAwareness: 0.8,
          objectiveControl: 0.85,
          itemization: 0.75
        },
        chanceFactors: {
          criticalStrikes: 0.4,
          dragonSpawns: 0.3,
          matchmaking: 0.2
        }
      },

      'CS:GO': {
        mechanicalRequirements: 0.95,   // Extremely high mechanical skill
        strategyDepth: 0.8,             // High strategic depth
        teamworkImportance: 0.75,       // Important team play
        randomElements: 0.15,           // Very low RNG
        learningCurve: 0.9,             // Very steep learning curve
        skillFactors: {
          aimAccuracy: 0.95,
          recoilControl: 0.9,
          positioningGame: 0.85,
          utilityUsage: 0.8,
          economyManagement: 0.75
        },
        chanceFactors: {
          sprayPatterns: 0.2,
          spawns: 0.1,
          teamBalance: 0.15
        }
      },

      'Hearthstone': {
        mechanicalRequirements: 0.3,    // Low mechanical skill
        strategyDepth: 0.8,             // High strategic depth
        teamworkImportance: 0.1,        // No teamwork (solo)
        randomElements: 0.7,            // High RNG (card draws)
        learningCurve: 0.6,             // Moderate learning curve
        skillFactors: {
          deckBuilding: 0.85,
          resourceManagement: 0.8,
          matchupKnowledge: 0.75,
          turnPlanning: 0.8,
          adaptability: 0.7
        },
        chanceFactors: {
          cardDraws: 0.8,
          randomEffects: 0.7,
          startingHand: 0.6
        }
      },

      'Poker': {
        mechanicalRequirements: 0.2,    // Low mechanical skill
        strategyDepth: 0.8,             // High strategic depth
        teamworkImportance: 0.1,        // No teamwork
        randomElements: 0.7,            // High RNG (card deals)
        learningCurve: 0.7,             // Moderate-high learning curve
        skillFactors: {
          probabilityCalculation: 0.85,
          psychologyReading: 0.9,
          bankrollManagement: 0.8,
          positionPlay: 0.75,
          bluffing: 0.85
        },
        chanceFactors: {
          cardDeals: 0.8,
          opponentActions: 0.6,
          tablePosition: 0.4
        }
      },

      'Rocket League': {
        mechanicalRequirements: 0.9,    // Very high mechanical skill
        strategyDepth: 0.7,             // Moderate-high strategy
        teamworkImportance: 0.75,       // Important team play
        randomElements: 0.1,            // Very low RNG
        learningCurve: 0.85,            // Steep learning curve
        skillFactors: {
          carControl: 0.95,
          aerialMechanics: 0.9,
          ballControl: 0.85,
          positioning: 0.8,
          boostManagement: 0.75
        },
        chanceFactors: {
          spawns: 0.1,
          teamAssignment: 0.15,
          physics: 0.05
        }
      },

      'Dota 2': {
        mechanicalRequirements: 0.85,   // High mechanical skill
        strategyDepth: 0.95,            // Extremely high strategy
        teamworkImportance: 0.9,        // Crucial teamwork
        randomElements: 0.35,           // Some RNG elements
        learningCurve: 0.95,            // Extremely steep learning curve
        skillFactors: {
          heroMechanics: 0.9,
          lastHitting: 0.85,
          mapAwareness: 0.85,
          itemization: 0.8,
          heroCounters: 0.85
        },
        chanceFactors: {
          runes: 0.4,
          neutralItems: 0.3,
          criticalStrikes: 0.35
        }
      },

      'PUBG': {
        mechanicalRequirements: 0.8,    // High mechanical skill
        strategyDepth: 0.75,            // Moderate-high strategy
        teamworkImportance: 0.6,        // Moderate teamwork
        randomElements: 0.5,            // Significant RNG
        learningCurve: 0.75,            // High learning curve
        skillFactors: {
          aimControl: 0.85,
          positioning: 0.8,
          looting: 0.7,
          vehicleControl: 0.6,
          zoneManagement: 0.75
        },
        chanceFactors: {
          lootSpawns: 0.6,
          zoneCircles: 0.5,
          vehicleSpawns: 0.4
        }
      },

      'Magic: The Gathering Arena': {
        mechanicalRequirements: 0.3,    // Low mechanical skill
        strategyDepth: 0.9,             // Very high strategy
        teamworkImportance: 0.1,        // No teamwork
        randomElements: 0.6,            // High RNG (deck shuffling)
        learningCurve: 0.85,            // Steep learning curve
        skillFactors: {
          deckBuilding: 0.9,
          resourceManagement: 0.85,
          sequencing: 0.8,
          sideboarding: 0.75,
          metaKnowledge: 0.85
        },
        chanceFactors: {
          deckShuffling: 0.7,
          startingHand: 0.6,
          topdecks: 0.5
        }
      }
    };

    return gameMetrics[gameType] || null;
  }

  // Add this method for real-time analysis during gameplay
  static async analyzeRealTimeMatch(matchData) {
    try {
      // Get base game analysis
      const gameTypeAnalysis = await this.analyzeGameType(matchData.gameType);
      
      // Combine with real-time data
      const realTimeAnalysis = await this.analyzeGameOutcome(matchData);

      return {
        ...realTimeAnalysis,
        baseGameAnalysis: gameTypeAnalysis,
        overallAssessment: this.combineAnalyses(gameTypeAnalysis, realTimeAnalysis)
      };
    } catch (error) {
      console.error('Real-time Analysis Error:', error);
      throw error;
    }
  }

  static combineAnalyses(baseAnalysis, realTimeAnalysis) {
    // Combine base game analysis with real-time match data
    return {
      finalSkillPercentage: (baseAnalysis.baseSkillFactors.mechanicalSkill * 0.4) + 
                           (realTimeAnalysis.skillPercentage * 0.6),
      finalChancePercentage: (baseAnalysis.baseChanceFactors.randomElements * 0.4) + 
                            (realTimeAnalysis.chancePercentage * 0.6),
      confidence: realTimeAnalysis.confidence,
      recommendations: this.generateRecommendations(baseAnalysis, realTimeAnalysis)
    };
  }

  static generateRecommendations(baseAnalysis, realTimeAnalysis) {
    // Generate personalized recommendations based on both analyses
    return {
      skillsToFocus: this.identifySkillGaps(baseAnalysis, realTimeAnalysis),
      playstyleAdjustments: this.suggestPlaystyleChanges(baseAnalysis, realTimeAnalysis),
      trainingRecommendations: this.getTrainingRecommendations(baseAnalysis, realTimeAnalysis)
    };
  }

  static evaluateDecisions(decisions) {
    if (!decisions || decisions.length === 0) return 0;
    
    const successfulDecisions = decisions.filter(d => d.success).length;
    return (successfulDecisions / decisions.length) * 100;
  }

  static calculateAverage(numbers) {
    if (!numbers || numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  static evaluateStrategySuccess(actions) {
    if (!actions || actions.length === 0) return 0;
    
    const successfulActions = actions.filter(a => a.success).length;
    return (successfulActions / actions.length) * 100;
  }

  static evaluateTeamwork(events) {
    if (!events || events.length === 0) return 0;
    
    const successfulEvents = events.filter(e => e.success).length;
    return (successfulEvents / events.length) * 100;
  }

  static calculateRandomnessScore(events) {
    if (!events || events.length === 0) return 0;
    
    // Calculate how random the spawn patterns are
    const locations = events.map(e => e.location);
    const uniqueLocations = new Set(locations);
    
    // More unique locations = more randomness
    return (uniqueLocations.size / events.length) * 100;
  }

  static calculateSpreadImpact(events) {
    if (!events || events.length === 0) return 0;
    
    const criticalHits = events.filter(e => e.isCritical).length;
    return (criticalHits / events.length) * 100;
  }

  static calculateCriticalImpact(criticalHits) {
    if (!criticalHits || criticalHits.length === 0) return 0;
    return (criticalHits.length / 100) * 100; // Normalize to percentage
  }

  static calculateTeamBalanceScore(teams) {
    if (!teams || !teams.team1 || !teams.team2) return 0;
    
    // Compare average ranks and team sizes
    const rankDiff = Math.abs(
      this.getRankValue(teams.team1.averageRank) - 
      this.getRankValue(teams.team2.averageRank)
    );
    
    const sizeDiff = Math.abs(teams.team1.players - teams.team2.players);
    
    // Perfect balance = 0, worst balance = 100
    return 100 - ((rankDiff + sizeDiff) * 10);
  }

  static getRankValue(rank) {
    const ranks = {
      'Iron': 1,
      'Bronze': 2,
      'Silver': 3,
      'Gold': 4,
      'Platinum': 5,
      'Diamond': 6,
      'Master': 7,
      'Grandmaster': 8
    };
    return ranks[rank] || 0;
  }

  static calculateEnvironmentalImpact(events) {
    if (!events || events.length === 0) return 0;
    
    const impactValues = {
      'low': 0.2,
      'medium': 0.5,
      'high': 0.8
    };
    
    const totalImpact = events.reduce((sum, event) => 
      sum + (impactValues[event.impact] || 0), 0
    );
    
    return (totalImpact / events.length) * 100;
  }

  static analyzeMechanics(gameMetrics) {
    if (!gameMetrics) return 0;
    return gameMetrics.mechanicalRequirements * 100;
  }

  static analyzeStrategy(gameMetrics) {
    if (!gameMetrics) return 0;
    return gameMetrics.strategyDepth * 100;
  }

  static analyzeTeamwork(gameMetrics) {
    if (!gameMetrics) return 0;
    return gameMetrics.teamworkImportance * 100;
  }

  static analyzeLearningCurve(gameMetrics) {
    if (!gameMetrics) return 0;
    return gameMetrics.learningCurve * 100;
  }

  static analyzeRandomness(gameMetrics) {
    if (!gameMetrics) return 0;
    return gameMetrics.randomElements * 100;
  }

  static analyzeLuckMechanics(gameMetrics) {
    if (!gameMetrics) return 0;
    // Calculate luck-based mechanics from random elements and other factors
    return (gameMetrics.randomElements * 0.7 + 0.3) * 100;
  }

  static analyzeEnvironmental(gameMetrics) {
    if (!gameMetrics) return 0;
    // Environmental factors are usually a subset of random elements
    return (gameMetrics.randomElements * 0.5) * 100;
  }

  static getBaseClassification(gameMetrics) {
    if (!gameMetrics) return 'UNKNOWN';
    
    const skillValue = (gameMetrics.mechanicalRequirements + 
                       gameMetrics.strategyDepth + 
                       gameMetrics.teamworkImportance) / 3;
    
    const chanceValue = gameMetrics.randomElements;
    
    if (skillValue > chanceValue * 1.5) return 'SKILL_BASED';
    if (chanceValue > skillValue * 1.5) return 'CHANCE_BASED';
    return 'MIXED';
  }

  static getRecommendedSkills(gameMetrics) {
    if (!gameMetrics) return [];
    
    const skills = [];
    if (gameMetrics.mechanicalRequirements > 0.6) skills.push('MECHANICAL');
    if (gameMetrics.strategyDepth > 0.6) skills.push('STRATEGIC');
    if (gameMetrics.teamworkImportance > 0.6) skills.push('TEAMWORK');
    if (gameMetrics.learningCurve > 0.7) skills.push('DEDICATION');
    
    return skills;
  }
}

module.exports = GameAnalysisService; 