class GamingBehaviorMonitor {
    constructor() {
        this.sessions = new Map();
        this.alertThresholds = {
            sessionDuration: 2 * 60 * 60 * 1000, // 2 hours
            dailyPlaytime: 6 * 60 * 60 * 1000,   // 6 hours
            spendingLimit: 100,                   // $100 per day
            lossStreak: 5,                        // 5 consecutive losses
            nightTimeGaming: {
                start: 23, // 11 PM
                end: 5     // 5 AM
            }
        };
    }

    startSession(userId, gameType) {
        const session = {
            startTime: Date.now(),
            gameType,
            events: [],
            losses: 0,
            wins: 0,
            spending: 0,
            breaks: [],
            alerts: [],
            lastAlert: null
        };

        this.sessions.set(userId, session);
        return session;
    }

    async monitorBehavior(userId, event) {
        const session = this.sessions.get(userId);
        if (!session) return null;

        session.events.push(event);

        // Run all checks
        const alerts = await this.runBehaviorChecks(userId, session);
        
        // Send alerts if needed
        if (alerts.length > 0) {
            await this.sendAlerts(userId, alerts);
        }

        return alerts;
    }

    async runBehaviorChecks(userId, session) {
        const alerts = [];

        // 1. Session Duration Check
        const sessionDuration = Date.now() - session.startTime;
        if (sessionDuration > this.alertThresholds.sessionDuration) {
            alerts.push({
                type: 'SESSION_DURATION',
                severity: 'WARNING',
                message: 'You have been playing for over 2 hours. Consider taking a break.',
                recommendation: 'Take a 15-minute break to rest your eyes and stretch.'
            });
        }

        // 2. Loss Streak Check
        if (session.losses >= this.alertThresholds.lossStreak) {
            alerts.push({
                type: 'LOSS_STREAK',
                severity: 'ALERT',
                message: `You've lost ${session.losses} games in a row. This might lead to tilt.`,
                recommendation: 'Consider taking a longer break or switching to a different activity.'
            });
        }

        // 3. Night Gaming Check
        const currentHour = new Date().getHours();
        if (currentHour >= this.alertThresholds.nightTimeGaming.start || 
            currentHour <= this.alertThresholds.nightTimeGaming.end) {
            alerts.push({
                type: 'NIGHT_GAMING',
                severity: 'INFO',
                message: 'Gaming late at night can affect your sleep pattern.',
                recommendation: 'Try to maintain a regular sleep schedule for better gaming performance.'
            });
        }

        // 4. Spending Pattern Check
        if (session.spending > this.alertThresholds.spendingLimit) {
            alerts.push({
                type: 'SPENDING',
                severity: 'CRITICAL',
                message: 'You have exceeded your daily spending limit.',
                recommendation: 'Review your gaming expenses and consider setting stricter limits.'
            });
        }

        // 5. Chase Loss Pattern Check
        if (this.detectChaseLossPattern(session.events)) {
            alerts.push({
                type: 'CHASE_LOSS',
                severity: 'CRITICAL',
                message: 'You appear to be chasing losses with increased spending.',
                recommendation: 'This is a common gambling behavior. Consider stepping away.'
            });
        }

        return alerts;
    }

    detectChaseLossPattern(events) {
        // Look for increasing bets/spending after losses
        let lastBet = 0;
        let increasingBets = 0;

        for (const event of events.slice(-10)) { // Look at last 10 events
            if (event.type === 'bet' || event.type === 'purchase') {
                if (event.amount > lastBet) {
                    increasingBets++;
                }
                lastBet = event.amount;
            }
        }

        return increasingBets >= 3; // Pattern detected if 3 or more increasing bets
    }

    async sendAlerts(userId, alerts) {
        // Send through WebSocket for real-time alerts
        const io = require('../config/socket');
        io.to(userId).emit('behavior_alerts', alerts);

        // Store alerts in database
        await this.storeAlerts(userId, alerts);

        // If critical alerts, trigger additional actions
        const criticalAlerts = alerts.filter(alert => alert.severity === 'CRITICAL');
        if (criticalAlerts.length > 0) {
            await this.handleCriticalAlerts(userId, criticalAlerts);
        }
    }

    async handleCriticalAlerts(userId, alerts) {
        // 1. Send email notification
        await this.sendEmailNotification(userId, alerts);

        // 2. Trigger cool-down period
        await this.enforceCooldown(userId);

        // 3. Log for counselor review if enabled
        await this.logForCounselor(userId, alerts);
    }

    async enforceCooldown(userId) {
        const session = this.sessions.get(userId);
        if (!session) return;

        session.cooldownStart = Date.now();
        session.cooldownDuration = 30 * 60 * 1000; // 30 minutes

        // Notify user about cooldown
        const io = require('../config/socket');
        io.to(userId).emit('cooldown_started', {
            duration: session.cooldownDuration,
            endTime: session.cooldownStart + session.cooldownDuration
        });
    }
}

module.exports = new GamingBehaviorMonitor(); 