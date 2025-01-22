const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const { connectDB, disconnectDB } = require('./setup/testDb');

describe('Full Application Test Suite', () => {
    let authToken;
    let userId;

    // Before all tests
    beforeAll(async () => {
        await connectDB();
        await User.deleteMany({});
    });

    // After all tests
    afterAll(async () => {
        await User.deleteMany({});
        await disconnectDB();
    });

    // Auth Tests
    describe('Authentication', () => {
        test('should register new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@test.com',
                    password: 'Test123!'
                });
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('token');
            authToken = res.body.token;
        });

        test('should login user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@test.com',
                    password: 'Test123!'
                });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
        });
    });

    // Game Profile Tests
    describe('Game Profile', () => {
        test('should add gaming platform', async () => {
            const res = await request(app)
                .post('/api/game-profile/platform')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    platformName: 'Steam',
                    username: 'testplayer'
                });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('platforms');
        });

        test('should add game to platform', async () => {
            const res = await request(app)
                .post('/api/game-profile/platform/Steam/game')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    gameName: 'CSGO',
                    totalPlaytime: 3600
                });
            expect(res.status).toBe(200);
            expect(res.body.platforms[0].games).toHaveLength(1);
        });

        test('should get gaming profile', async () => {
            const res = await request(app)
                .get('/api/game-profile/profile')
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('platforms');
        });
    });

    // Behavior Analysis Tests
    describe('Behavior Analysis', () => {
        test('should analyze behavior', async () => {
            const res = await request(app)
                .post('/api/behavior/analyze')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    content: 'Test message',
                    type: 'CHAT',
                    context: {
                        gameType: 'COMPETITIVE',
                        matchId: '12345',
                        reportedBy: 'system'
                    }
                });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('type');
            expect(res.body).toHaveProperty('content');
            expect(res.body).toHaveProperty('toxicityScore');
        });

        test('should analyze gameplay behavior', async () => {
            const res = await request(app)
                .post('/api/behavior/analyze')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    content: 'Player killed teammate',
                    type: 'GAMEPLAY',
                    context: {
                        gameType: 'CASUAL',
                        matchId: '12346'
                    }
                });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('type');
            expect(res.body).toHaveProperty('toxicityScore');
        });

        test('should handle report behavior', async () => {
            const res = await request(app)
                .post('/api/behavior/analyze')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    content: 'Inappropriate behavior in chat',
                    type: 'REPORT',
                    context: {
                        gameType: 'RANKED',
                        matchId: '12347',
                        reportedBy: 'user123'
                    }
                });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('type');
            expect(res.body).toHaveProperty('toxicityScore');
        });

        test('should get behavior report', async () => {
            const res = await request(app)
                .get('/api/behavior/report')
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(200);
        });

        test('should handle invalid behavior type', async () => {
            const res = await request(app)
                .post('/api/behavior/analyze')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    content: 'Test message',
                    type: 'INVALID_TYPE',
                    context: {
                        gameType: 'CASUAL'
                    }
                });
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('error');
        });
    });

    // Error Handling Tests
    describe('Error Handling', () => {
        test('should handle invalid routes', async () => {
            const res = await request(app)
                .get('/api/nonexistent');
            expect(res.status).toBe(404);
        });

        test('should handle unauthorized access', async () => {
            const res = await request(app)
                .get('/api/game-profile/profile')
                .set('Authorization', 'Bearer invalid-token');
            expect(res.status).toBe(401);
        });

        test('should handle invalid data', async () => {
            const res = await request(app)
                .post('/api/behavior/analyze')
                .set('Authorization', `Bearer ${authToken}`)
                .send({});
            expect(res.status).toBe(400);
        });
    });
}); 