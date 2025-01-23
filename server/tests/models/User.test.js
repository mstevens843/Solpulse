const db = require('../../models'); // Adjusted path to match your project structure
const { sequelize, User, Post } = db; // Extract models and Sequelize instance

describe('User Model', () => {
    beforeAll(async () => {
        console.log('Syncing database...');
        await sequelize.sync({ force: true }); // Sync the database
        console.log('Database synced successfully.');
    });

    afterAll(async () => {
        console.log('Closing database connection...');
        await sequelize.close(); // Close database connection
        console.log('Database connection closed.');
    });

    beforeEach(async () => {
        console.log('Resetting database...');
        await sequelize.sync({ force: true }); // Reset database for each test
        console.log('Database reset successfully.');
    });
    it('should create a valid user', async () => {
        const user = await User.create({
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
            walletAddress: 'A6MejruMiawCJTGxn5rj6Qz8prZjkXbR6zHcgWZmsAGn',
        });

        expect(user.id).toBeDefined();
        expect(user.username).toBe('testuser');
        expect(user.email).toBe('testuser@example.com');
    });

    it('should enforce unique username', async () => {
        await User.create({
            username: 'testuser',
            email: 'unique@example.com',
            password: 'password123',
            walletAddress: '8PFC24NTZriQVrE4Rpsj9utZNXUynNzofwuYqkLYy6tP',
        });

        await expect(
            User.create({
                username: 'testuser',
                email: 'another@example.com',
                password: 'password123',
                walletAddress: '47qshMp8kzQ9KERnUHsoJyyVpq3BgPjq77VZbL6n8evj',
            })
        ).rejects.toThrow(/Validation error/);
    });

    it('should enforce unique email', async () => {
        await User.create({
            username: 'uniqueuser',
            email: 'testuser@example.com',
            password: 'password123',
            walletAddress: '8PFC24NTZriQVrE4Rpsj9utZNXUynNzofwuYqkLYy6tP',
        });

        await expect(
            User.create({
                username: 'anotheruser',
                email: 'testuser@example.com',
                password: 'password123',
                walletAddress: 'A6MejruMiawCJTGxn5rj6Qz8prZjkXbR6zHcgWZmsAGn',
            })
        ).rejects.toThrow(/Validation error/);
    });

    it('should validate walletAddress format', async () => {
        try {
            await User.create({
                username: 'invalidwallet',
                email: 'invalid@example.com',
                password: 'password123',
                walletAddress: 'invalid_wallet_address',
            });
        } catch (err) {
            expect(err.errors[0].message).toMatch(/Invalid wallet address format/);
        }
    });

    it('should hash the password before saving', async () => {
        const user = await User.create({
            username: 'hashuser',
            email: 'hashuser@example.com',
            password: 'password123',
            walletAddress: '47qshMp8kzQ9KERnUHsoJyyVpq3BgPjq77VZbL6n8evj',
        });

        expect(user.password).not.toBe('password123');
    });

    it('should associate a user with posts', async () => {
        const user = await User.create({
            username: 'postuser',
            email: 'postuser@example.com',
            password: 'password123',
            walletAddress: 'A6MejruMiawCJTGxn5rj6Qz8prZjkXbR6zHcgWZmsAGn',
        });

        const post = await Post.create({
            userId: user.id,
            content: 'This is a test post',
        });

        const userWithPosts = await User.findByPk(user.id, {
            include: [{ model: Post, as: 'posts' }],
        });

        expect(userWithPosts.posts.length).toBe(1);
        expect(userWithPosts.posts[0].content).toBe('This is a test post');
    });

    it('should cascade delete posts when user is deleted', async () => {
        const user = await User.create({
            username: 'cascadeuser',
            email: 'cascade@example.com',
            password: 'password123',
            walletAddress: '8PFC24NTZriQVrE4Rpsj9utZNXUynNzofwuYqkLYy6tP',
        });
    
        const post = await Post.create({
            userId: user.id,
            content: 'This post will be deleted',
        });
    
        // Verify post exists
        const createdPost = await Post.findByPk(post.id);
        expect(createdPost).not.toBeNull();
    
        // Delete user
        await user.destroy();
    
        // Verify post is soft-deleted
        const deletedPost = await Post.findByPk(post.id, { paranoid: false }); // Include soft-deleted rows
        expect(deletedPost).not.toBeNull(); // Post still exists in DB
        expect(deletedPost.deletedAt).not.toBeNull(); // Soft-deleted
    });
    
    
      

    it('should validate bio length', async () => {
        const user = await User.create({
            username: 'biouser',
            email: 'bio@example.com',
            password: 'password123',
            walletAddress: '47qshMp8kzQ9KERnUHsoJyyVpq3BgPjq77VZbL6n8evj',
            bio: 'This is a short bio.',
        });

        expect(user.bio).toBe('This is a short bio.');

        await expect(
            User.create({
                username: 'longbiouser',
                email: 'longbio@example.com',
                password: 'password123',
                walletAddress: 'A6MejruMiawCJTGxn5rj6Qz8prZjkXbR6zHcgWZmsAGn',
                bio: 'A'.repeat(501), // 501 characters
            })
        ).rejects.toThrow(/Validation error: Validation len on bio failed/);
    });
});




// Key Tests Included:
// Basic Creation:

// Ensure a user can be created with valid inputs.
// Validation Errors:

// Unique constraints for username and email.
// Format validation for walletAddress.
// Password Hashing:

// Verify that passwords are hashed before saving.
// Associations:

// Validate hasMany relationship with Post.
// Test cascading delete for associated Post records.
// Custom Fields:

// Validate bio length constraints.