const request = require('supertest');
const app = require('../../app'); // Path to app.js
const { sequelize, User, Follower } = require('../../models/Index'); // Import models
const path = require('path');
console.log('Resolved Middleware Path:', path.resolve(__dirname, '../middleware/auth'));

// Mock auth middleware
jest.mock('../../middleware/auth', () =>
    jest.fn((req, res, next) => {
        req.user = { id: 1, username: 'BlackCryptoKing' }; // Mock user
        next();
    })
);

let server; // Variable to store the server instance

beforeAll(async () => {
    // Sync database and start server
    await sequelize.sync({ force: true });
    server = app.listen(3000);

    // Create test users
    await User.bulkCreate([
        { username: 'BlackCryptoKing', email: 'king@example.com', password: 'password123', walletAddress: 'address1' },
        { username: 'CryptoQueenBee', email: 'queen@example.com', password: 'password123', walletAddress: 'address2' },
    ]);
});

afterAll(async () => {
    // Close the database connection and server
    await sequelize.close();
    server.close();
});

beforeEach(async () => {
    // Reset followers for each test
    await Follower.destroy({ truncate: true, cascade: true });
});

describe('User API Routes - Crypto Fat People Tests', () => {
    describe('POST /:id/follow', () => {
        it('should allow BlackCryptoKing to follow CryptoQueenBee', async () => {
            const res = await request(app)
                .post('/api/users/2/follow')
                .set('Authorization', 'Bearer fake-token');

            expect(res.status).toBe(201);
            expect(res.body.message).toBe('User followed successfully.');
        });

        it('should not allow CryptoQueenBee to follow themselves', async () => {
            const res = await request(app)
                .post('/api/users/1/follow')
                .set('Authorization', 'Bearer fake-token');

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('You cannot follow yourself.');
        });
    });

    describe('DELETE /:id/unfollow', () => {
        it('should allow BlackCryptoKing to unfollow CryptoQueenBee', async () => {
            await Follower.create({ followerId: 1, followingId: 2 });

            const res = await request(app)
                .delete('/api/users/2/unfollow')
                .set('Authorization', 'Bearer fake-token');

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('User unfollowed successfully.');
        });
    });

    describe('GET /:id/is-following', () => {
        it('should confirm BlackCryptoKing is following CryptoQueenBee', async () => {
            await Follower.create({ followerId: 1, followingId: 2 });

            const res = await request(app)
                .get('/api/users/2/is-following')
                .set('Authorization', 'Bearer fake-token');

            expect(res.status).toBe(200);
            expect(res.body.isFollowing).toBe(true);
        });

        it('should return false if BlackCryptoKing is not following CryptoQueenBee', async () => {
            const res = await request(app)
                .get('/api/users/3/is-following')
                .set('Authorization', 'Bearer fake-token');

            expect(res.status).toBe(200);
            expect(res.body.isFollowing).toBe(false);
        });
    });

    describe('GET /me', () => {
        it('should fetch details of BlackCryptoKing', async () => {
            const res = await request(app)
                .get('/api/users/me')
                .set('Authorization', 'Bearer fake-token');

            expect(res.status).toBe(200);
            expect(res.body.username).toBe('BlackCryptoKing');
            expect(res.body.email).toBe('king@example.com');
        });
    });

    describe('GET /:id', () => {
        it('should fetch CryptoQueenBee\'s profile and posts', async () => {
            const res = await request(app)
                .get('/api/users/2')
                .set('Authorization', 'Bearer fake-token');

            expect(res.status).toBe(200);
            expect(res.body.user.username).toBe('CryptoQueenBee');
            expect(res.body.posts).toBeDefined();
        });

        it('should return an error if the user does not exist', async () => {
            const res = await request(app)
                .get('/api/users/999')
                .set('Authorization', 'Bearer fake-token');

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('User not found.');
        });
    });
});

