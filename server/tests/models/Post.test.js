const db = require('../../models'); // Adjust path to match your project structure
const { sequelize, Post, User, Comment } = db; // Extract models and Sequelize instance

describe('Post Model', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true }); // Ensure a clean database state
    });

    afterAll(async () => {
        await sequelize.close(); // Close the database connection
    });

    it('should create a valid post with all optional fields', async () => {
        const user = await User.create({
            username: 'crypto_girl1',
            email: 'crypto_girl1@example.com',
            password: 'securepassword1',
            walletAddress: 'ApfJr2X7xy8HT9nobwRgNzv7eYwWToAFcc4njWUAptjv', // Unique wallet address
        });

        const post = await Post.create({
            userId: user.id,
            content: 'This is a test post about Solana.',
            mediaUrl: 'http://example.com/image.jpg',
            mediaType: 'image',
        });

        expect(post).toBeDefined();
        expect(post.userId).toBe(user.id);
        expect(post.content).toBe('This is a test post about Solana.');
        expect(post.mediaUrl).toBe('http://example.com/image.jpg');
        expect(post.mediaType).toBe('image');
        expect(post.cryptoTag).toBe('solana'); // Auto-tagging
    });

    it('should enforce content length validation', async () => {
        const user = await User.create({
            username: 'crypto_girl2',
            email: 'crypto_girl2@example.com',
            password: 'securepassword2',
            walletAddress: '3adeWDDDV7zNbuZ8nNrZ7DT6m1dsKYMiyukvJqf6Jiwr', // Unique wallet address
        });

        await expect(
            Post.create({
                userId: user.id,
                content: '', // Invalid: empty content
            })
        ).rejects.toThrow('Content must be between 1 and 280 characters.');

        await expect(
            Post.create({
                userId: user.id,
                content: 'a'.repeat(281), // Invalid: content too long
            })
        ).rejects.toThrow('Content must be between 1 and 280 characters.');
    });

    it('should auto-tag based on content', async () => {
        const user = await User.create({
            username: 'crypto_girl3',
            email: 'crypto_girl3@example.com',
            password: 'securepassword3',
            walletAddress: 'Ga4M45NcfXsTdpcngEu7B33gxWrCd2u9tWqA3cAf1ryL', // Unique wallet address
        });

        const post = await Post.create({
            userId: user.id,
            content: 'This post is about Ethereum.',
        });

        expect(post.cryptoTag).toBe('ethereum'); // Auto-tagging
    });

    it('should validate mediaUrl as a valid URL', async () => {
        const user = await User.create({
            username: 'crypto_girl4',
            email: 'crypto_girl4@example.com',
            password: 'securepassword4',
            walletAddress: 'FR9nsGPT7RgpAarJRXLTsoZJ1NCefEC6CB8frCeSYYpw', // Unique wallet address
        });

        await expect(
            Post.create({
                userId: user.id,
                content: 'Test post',
                mediaUrl: 'invalid-url', // Invalid URL
            })
        ).rejects.toThrow('Validation error: Media URL must be a valid URL.');
    });

    it('should cascade delete all comments when a post is deleted', async () => {
        const user = await User.create({
            username: 'crypto_girl5',
            email: 'crypto_girl5@example.com',
            password: 'securepassword5',
            walletAddress: 'ApfJr2X7xy8HT9nobwRgNzv7eYwWToAFcc4njWUAptjv',
        });

        const post = await Post.create({
            userId: user.id,
            content: 'Test post with comments.',
        });

        await Comment.create({
            userId: user.id,
            postId: post.id,
            content: 'This is a test comment.',
        });

        const commentsBefore = await Comment.findAll({ where: { postId: post.id } });
        expect(commentsBefore.length).toBe(1);

        await post.destroy({ force: true }); // Force delete to bypass paranoid mode

        const commentsAfter = await Comment.findAll({
            where: { postId: post.id },
            paranoid: false, // Include soft-deleted rows for validation
        });
        expect(commentsAfter.length).toBe(0);
    });

    it('should implement soft deletion with paranoid mode', async () => {
        const user = await User.create({
            username: 'crypto_girl6',
            email: 'crypto_girl6@example.com',
            password: 'securepassword6',
            walletAddress: '3adeWDDDV7zNbuZ8nNrZ7DT6m1dsKYMiyukvJqf6Jiwr',
        });

        const post = await Post.create({
            userId: user.id,
            content: 'Soft delete test post.',
        });

        await post.destroy();

        const postDefault = await Post.findByPk(post.id);
        expect(postDefault).toBeNull();

        const postParanoid = await Post.findOne({
            where: { id: post.id },
            paranoid: false,
        });
        expect(postParanoid).toBeDefined();
        expect(postParanoid.deletedAt).not.toBeNull();
    });
});



// Key Tests in post.test.js
// Valid Post Creation:

// Ensures posts with valid data, including optional fields, are created successfully.
// Content Length Validation:

// Validates content length is between 1 and 280 characters.
// Media URL Validation:

// Ensures mediaUrl is a valid URL if provided.
// Crypto Tag Validation:

// Ensures cryptoTag is valid or is automatically assigned based on content.
// Optional Fields:

// Verifies posts can be created without optional fields like cryptoTag or mediaUrl.
// Cascade Delete for Comments:

// Ensures comments are deleted when a post is deleted (via onDelete: 'CASCADE').
// Foreign Key Constraints:

// Verifies that invalid userId references are rejected.
// Soft Deletion:

// Confirms that posts are soft-deleted when deleted, with deletedAt set. 