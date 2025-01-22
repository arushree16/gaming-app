const io = require('../config/socket');
const FraudDetectionService = require('./fraudDetectionService');

class RealTimeMonitoringService {
    constructor() {
        this.activeUsers = new Map();
        this.monitoringIntervals = new Map();
        this.checkInterval = 5000; // Check every 5 seconds
        
        // Risk thresholds
        this.thresholds = {
            actionsPerMinute: 300,    // Max actions per minute
            suspiciousPatterns: 5,     // Max suspicious patterns
            riskScore: 80             // Max risk score
        };
    }

    startMonitoring(userId, sessionId) {
        // Initialize user monitoring
        this.activeUsers.set(userId, {
            sessionId,
            startTime: Date.now(),
            actions: [],
            patterns: [],
            lastCheck: Date.now(),
            warnings: 0,
            riskScore: 0
        });

        // Start interval checking
        const intervalId = setInterval(() => {
            this.checkUserActivity(userId);
        }, this.checkInterval);

        this.monitoringIntervals.set(userId, intervalId);

        return { message: 'Monitoring started', userId, sessionId };
    }

    async recordAction(userId, action) {
        const userSession = this.activeUsers.get(userId);
        if (!userSession) return;

        // Add timestamp to action
        action.timestamp = Date.now();
        userSession.actions.push(action);

        // Check for immediate red flags
        if (this.isHighRiskAction(action)) {
            await this.handleHighRiskAction(userId, action);
        }

        // Update patterns
        this.updatePatterns(userId, action);
    }

    async checkUserActivity(userId) {
        const userSession = this.activeUsers.get(userId);
        if (!userSession) return;

        try {
            // Calculate metrics
            const metrics = this.calculateMetrics(userSession);

            // Get fraud detection score
            const fraudScore = await FraudDetectionService.screenUser({
                userId,
                sessionId: userSession.sessionId,
                metrics
            });

            // Update risk score
            userSession.riskScore = fraudScore.riskScore;

            // Check for violations
            if (this.isViolatingThresholds(metrics, fraudScore)) {
                await this.handleViolation(userId, metrics, fraudScore);
            }

            // Emit status update
            this.emitStatusUpdate(userId, metrics, fraudScore);

            // Clean old actions
            this.cleanOldActions(userSession);

        } catch (error) {
            console.error('Monitoring Error:', error);
        }
    }

    calculateMetrics(userSession) {
        const now = Date.now();
        const recentActions = userSession.actions.filter(
            a => now - a.timestamp < 60000 // Last minute
        );

        return {
            actionsPerMinute: recentActions.length,
            sessionDuration: now - userSession.startTime,
            suspiciousPatterns: userSession.patterns.length,
            warningCount: userSession.warnings,
            riskScore: userSession.riskScore
        };
    }

    isViolatingThresholds(metrics, fraudScore) {
        return (
            metrics.actionsPerMinute > this.thresholds.actionsPerMinute ||
            metrics.suspiciousPatterns > this.thresholds.suspiciousPatterns ||
            fraudScore.riskScore > this.thresholds.riskScore
        );
    }

    async handleViolation(userId, metrics, fraudScore) {
        const userSession = this.activeUsers.get(userId);
        userSession.warnings++;

        // Determine action based on violation severity
        if (userSession.warnings >= 3) {
            await this.handleSevereViolation(userId, metrics, fraudScore);
        } else {
            await this.handleMinorViolation(userId, metrics, fraudScore);
        }
    }

    async handleHighRiskAction(userId, action) {
        // Emit immediate alert
        io.to(userId).emit('high_risk_action', {
            userId,
            action,
            timestamp: Date.now()
        });

        // Log the incident
        await this.logIncident(userId, 'HIGH_RISK_ACTION', action);
    }

    emitStatusUpdate(userId, metrics, fraudScore) {
        io.to(userId).emit('monitoring_update', {
            userId,
            metrics,
            fraudScore,
            timestamp: Date.now()
        });
    }

    cleanOldActions(userSession) {
        const now = Date.now();
        userSession.actions = userSession.actions.filter(
            action => now - action.timestamp < 300000 // Keep last 5 minutes
        );
    }

    stopMonitoring(userId) {
        // Clear interval
        const intervalId = this.monitoringIntervals.get(userId);
        if (intervalId) {
            clearInterval(intervalId);
            this.monitoringIntervals.delete(userId);
        }

        // Clean up user data
        this.activeUsers.delete(userId);

        return { message: 'Monitoring stopped', userId };
    }

    async handleSevereViolation(userId, metrics, fraudScore) {
        // Implement severe violation handling
        // Example: Block user, notify admin, etc.
        await this.blockUser(userId);
        await this.notifyAdmin(userId, metrics, fraudScore);
    }

    async handleMinorViolation(userId, metrics, fraudScore) {
        // Implement minor violation handling
        // Example: Warning, temporary restriction, etc.
        await this.issueWarning(userId, metrics, fraudScore);
    }
}

module.exports = new RealTimeMonitoringService(); 