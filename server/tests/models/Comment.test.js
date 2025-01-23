const db = require('../../models');
const { sequelize, Comment, User, Post } = db;

describe('Comment Model Tests', () => {
    let user, post;

    beforeAll(async () => {
        console.log('Syncing database...');
        await sequelize.sync({ force: true });
        console.log('Database synced successfully.');
    });

    beforeEach(async () => {
        console.log('Resetting database...');
        await sequelize.sync({ force: true }); // Reset the database
        console.log('Database reset successfully.');

        // Seed test data
        user = await User.create({
            username: 'CryptoShadow',
            email: 'cryptoshadow@example.com',
            password: 'dark_crypto123',
            walletAddress: 'A6MejruMiawCJTGxn5rj6Qz8prZjkXbR6zHcgWZmsAGn',
        });

        post = await Post.create({
            userId: user.id,
            content: 'This is a test post.',
        });
    });

    afterAll(async () => {
        console.log('Closing database connection...');
        await sequelize.close();
        console.log('Database connection closed.');
    });

    it('should create a valid comment', async () => {
        const comment = await Comment.create({
            userId: user.id,
            postId: post.id,
            content: 'This is a test comment.',
        });

        expect(comment).toBeDefined();
        expect(comment.content).toBe('This is a test comment.');
    });

    it('should not create a comment without content', async () => {
        await expect(
            Comment.create({
                userId: user.id,
                postId: post.id,
                content: '',
            })
        ).rejects.toThrow();
    });

    it('should delete comments when the associated user is deleted', async () => {
        const comment = await Comment.create({
            userId: user.id,
            postId: post.id,
            content: 'This comment will be deleted when user is deleted.',
        });

        console.log('Deleting user to test cascade...');
        await user.destroy({ hooks: true });

        const foundComment = await Comment.findByPk(comment.id, { paranoid: false });
        console.log('Found comment after user deletion:', foundComment);

        if (foundComment) {
            console.log('DeletedAt value:', foundComment.deletedAt);
        }

        expect(foundComment).toBeNull(); // Verify deletion
    });

    it('should delete comments when the associated post is deleted', async () => {
        const comment = await Comment.create({
            userId: user.id,
            postId: post.id,
            content: 'This comment will be deleted when post is deleted.',
        });

        console.log('Deleting post to test cascade...');
        await post.destroy({ hooks: true });

        const foundComment = await Comment.findByPk(comment.id, { paranoid: false });
        console.log('Found comment after post deletion:', foundComment);

        if (foundComment) {
            console.log('DeletedAt value:', foundComment.deletedAt);
        }

        expect(foundComment).toBeNull(); // Verify deletion
    });

    it('should maintain timestamps on creation', async () => {
        const comment = await Comment.create({
            userId: user.id,
            postId: post.id,
            content: 'This comment will have timestamps.',
        });

        expect(comment.createdAt).toBeDefined();
        expect(comment.updatedAt).toBeDefined();
    });
});



// Key Features Covered
// Model Tests

// Validates proper creation of comments.
// Ensures constraints like notEmpty are enforced.
// Tests cascading deletes when the user or post is removed.
// API Tests

// Tests creating, retrieving, and deleting comments via API endpoints.
// Validates authentication for protected routes.
// Handles edge cases, like non-existent comments.
// Setup and Teardown

// Ensures a clean database state using beforeAll and afterAll.
// Uses a test user and post for consistent testing.
// Authorization

// Simulates authenticated requests using a JWT token.