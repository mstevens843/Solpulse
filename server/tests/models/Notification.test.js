const db = require('../../models'); // Adjusted path to match your project structure
const { sequelize, Notification, User } = db; // Extract models and Sequelize instance

describe('Notification Model', () => {
    // Sync the database before running the tests
    beforeAll(async () => {
        await sequelize.sync({ force: true }); // Drop and recreate all tables
    });

    // Reset the database before each test
    beforeEach(async () => {
        await sequelize.sync({ force: true }); // Reset the database
    });

    // Close the connection after all tests
    afterAll(async () => {
        await sequelize.close();
    });

    it('should create a valid notification with default message', async () => {
        // Create sender and recipient
        const sender = await User.create({
            username: 'CryptoShadow',
            email: 'cryptoshadow@example.com',
            password: 'dark_crypto123',
            walletAddress: 'A6MejruMiawCJTGxn5rj6Qz8prZjkXbR6zHcgWZmsAGn',
        });
        const recipient = await User.create({
            username: 'EtherealMist',
            email: 'etherealmist@example.com',
            password: 'misty_sol',
            walletAddress: '8PFC24NTZriQVrE4Rpsj9utZNXUynNzofwuYqkLYy6tP',
        });

        // Create notification without explicit message
        const notification = await Notification.create({
            userId: recipient.id,
            actorId: sender.id,
            type: 'like',
        });

        expect(notification).toBeDefined();
        expect(notification.userId).toBe(recipient.id);
        expect(notification.actorId).toBe(sender.id);
        expect(notification.type).toBe('like');
        expect(notification.message).toBe('Your post was liked.');
        expect(notification.isRead).toBe(false);
    });

    it('should allow a custom message', async () => {
        const sender = await User.create({
            username: 'CryptoShadow',
            email: 'cryptoshadow@example.com',
            password: 'dark_crypto123',
            walletAddress: 'A6MejruMiawCJTGxn5rj6Qz8prZjkXbR6zHcgWZmsAGn',
        });
        const recipient = await User.create({
            username: 'EtherealMist',
            email: 'etherealmist@example.com',
            password: 'misty_sol',
            walletAddress: '8PFC24NTZriQVrE4Rpsj9utZNXUynNzofwuYqkLYy6tP',
        });

        const notification = await Notification.create({
            userId: recipient.id,
            actorId: sender.id,
            type: 'follow',
            message: 'A custom follow message.',
        });

        expect(notification.message).toBe('A custom follow message.');
    });

    it('should validate type is within the allowed ENUM values', async () => {
        const sender = await User.create({
            username: 'CryptoShadow',
            email: 'cryptoshadow@example.com',
            password: 'dark_crypto123',
            walletAddress: 'A6MejruMiawCJTGxn5rj6Qz8prZjkXbR6zHcgWZmsAGn',
        });
        const recipient = await User.create({
            username: 'EtherealMist',
            email: 'etherealmist@example.com',
            password: 'misty_sol',
            walletAddress: '8PFC24NTZriQVrE4Rpsj9utZNXUynNzofwuYqkLYy6tP',
        });

        await expect(
            Notification.create({
                userId: recipient.id,
                actorId: sender.id,
                type: 'invalid_type', // Invalid type
            })
        ).rejects.toThrow(/invalid input value for enum "enum_Notifications_type"/);
    });

    it('should automatically generate a transaction message with the amount', async () => {
        const sender = await User.create({
            username: 'CryptoShadow',
            email: 'cryptoshadow@example.com',
            password: 'dark_crypto123',
            walletAddress: 'A6MejruMiawCJTGxn5rj6Qz8prZjkXbR6zHcgWZmsAGn',
        });
        const recipient = await User.create({
            username: 'EtherealMist',
            email: 'etherealmist@example.com',
            password: 'misty_sol',
            walletAddress: '8PFC24NTZriQVrE4Rpsj9utZNXUynNzofwuYqkLYy6tP',
        });

        const notification = await Notification.create({
            userId: recipient.id,
            actorId: sender.id,
            type: 'transaction',
            amount: 10.5, // Transaction amount
        });

        expect(notification.message).toBe('You received 10.5 SOL.');
        expect(notification.amount).toBe(10.5);
    });

    it('should enforce foreign key constraints', async () => {
        await expect(
            Notification.create({
                userId: 9999, // Invalid user ID
                actorId: 9999, // Invalid actor ID
                type: 'like',
            })
        ).rejects.toThrow(/violates foreign key constraint/);
    });
});