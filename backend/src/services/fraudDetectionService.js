const axios = require('axios');

class FraudDetectionService {
    constructor() {
        this.apiKey = process.env.PROXYCHECK_API_KEY;
        this.baseUrl = 'https://proxycheck.io/v2';
    }

    async screenUser(userData) {
        try {
            const response = await axios.get(`${this.baseUrl}/${userData.ip}`, {
                params: {
                    key: this.apiKey,
                    vpn: 1,
                    risk: 1,
                    asn: 1,
                    node: 1,
                    time: 1,
                    inf: 1
                }
            });

            const data = response.data[userData.ip];
            const riskFactors = [];
            let riskScore = 0;

            // Check for proxy/VPN
            if (data.proxy === 'yes') {
                riskScore += 30;
                riskFactors.push('PROXY_DETECTED');
            }
            if (data.vpn === 'yes') {
                riskScore += 20;
                riskFactors.push('VPN_DETECTED');
            }

            // Check risk level
            if (data.risk >= 75) {
                riskScore += 40;
                riskFactors.push('HIGH_RISK_IP');
            }

            // Check for suspicious hosting
            if (data.type === 'Hosting') {
                riskScore += 15;
                riskFactors.push('HOSTING_IP');
            }

            return {
                riskScore,
                riskLevel: this.calculateRiskLevel(riskScore),
                isProxy: data.proxy === 'yes',
                isVPN: data.vpn === 'yes',
                risk: data.risk,
                location: {
                    country: data.country,
                    isp: data.provider,
                    asn: data.asn,
                    timezone: data.timezone
                },
                riskFactors,
                detectionDetails: {
                    type: data.type,
                    provider: data.provider,
                    lastSeen: data.last_seen,
                    attackHistory: data.attack_history || 'none'
                }
            };
        } catch (error) {
            console.error('Fraud Detection Error:', error);
            return {
                riskScore: 0,
                riskLevel: 'ERROR',
                isProxy: false,
                isVPN: false,
                error: error.message
            };
        }
    }

    calculateRiskLevel(score) {
        if (score >= 80) return 'HIGH';
        if (score >= 50) return 'MEDIUM';
        return 'LOW';
    }
}

module.exports = new FraudDetectionService(); 