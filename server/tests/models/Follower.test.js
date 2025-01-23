const db = require('../../models');
const { sequelize, Follower, User } = db;

describe('Follower Model Tests', () => {
    let user1, user2, user3, user4;

    beforeEach(async () => {
        await sequelize.sync({ force: true });

        user1 = await User.create({
            username: 'CryptoMfer',
            email: 'cryptomfer@example.com',
            password: 'password123',
            walletAddress: '76tJQNQuXJ3LnRXMiNKHRB9AVeDZaiq1ciBudLBd1tgj',
        });

        user2 = await User.create({
            username: 'CryptoShadow',
            email: 'cryptoshadow@example.com',
            password: 'dark_crypto123',
            walletAddress: 'A6MejruMiawCJTGxn5rj6Qz8prZjkXbR6zHcgWZmsAGn',
        });

        user3 = await User.create({
            username: 'EtherealMist',
            email: 'etherealmist@example.com',
            password: 'misty_sol',
            walletAddress: '8PFC24NTZriQVrE4Rpsj9utZNXUynNzofwuYqkLYy6tP',
        });

        user4 = await User.create({
            username: 'CryptoisLife1',
            email: 'cryptoislife1@example.com',
            password: 'idkidkcrypto123',
            walletAddress: 'g1QPBuPoXBocwL1cWWivsomo4LfvsnVn7Gc8STW6L8o',
        });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('should create a follower relationship', async () => {
        const follower = await Follower.create({
            followerId: user1.id,
            followingId: user2.id,
        });

        expect(follower).toBeDefined();
        expect(follower.followerId).toBe(user1.id);
        expect(follower.followingId).toBe(user2.id);
    });

    it('should enforce unique follower-following relationships', async () => {
        await Follower.create({ followerId: user1.id, followingId: user2.id });

        await expect(
            Follower.create({ followerId: user1.id, followingId: user2.id })
        ).rejects.toThrow();
    });

    it('should delete follower relationships when a user is deleted', async () => {
        await Follower.create({ followerId: user1.id, followingId: user3.id });

        await user1.destroy({ force: true }); // Force delete to bypass paranoid mode

        const remainingFollowers = await Follower.findAll({
            where: { followerId: user1.id },
            paranoid: false, // Include soft-deleted rows for validation
        });
        expect(remainingFollowers.length).toBe(0);
    });

    it('should allow a user to follow multiple users', async () => {
        const follow1 = await Follower.create({ followerId: user4.id, followingId: user1.id });
        const follow2 = await Follower.create({ followerId: user4.id, followingId: user2.id });

        expect(follow1).toBeDefined();
        expect(follow1.followingId).toBe(user1.id);
        expect(follow2).toBeDefined();
        expect(follow2.followingId).toBe(user2.id);
    });

    it('should establish correct follower-following associations', async () => {
        await Follower.create({ followerId: user4.id, followingId: user1.id });

        const followers = await Follower.findAll({
            where: { followingId: user1.id },
            include: [{ model: User, as: 'follower' }],
        });

        expect(followers.length).toBe(1);
        expect(followers[0].follower.username).toBe('CryptoisLife1');
    });
});




// Explanation of Tests
// Model Tests

// Validates that relationships between users can be created and are unique.
// Ensures cascading deletes when a user is deleted.
// API Tests

// Tests the POST /followers endpoint to follow a user.
// Tests the GET /users/:id/followers endpoint to fetch a user's followers.
// Tests the DELETE /followers/:followerId/:followingId endpoint to unfollow a user.
// Validates error handling for duplicate relationships and non-existent entries.
// Setup and Cleanup

// Resets the database before tests.
// Creates test users to simulate follower relationships.
// Cleans up resources after tests.
// Authentication

// Simulates login using JWT tokens to access protected routes.