const db = require('../../models'); // Adjusted path
const { sequelize, Message, User } = db; // Extract models

describe('Message Model', () => {
    beforeAll(async () => {
        console.log('Syncing database...');
        await sequelize.sync({ force: true });
        console.log('Database synced successfully.');
    });

    afterAll(async () => {
        console.log('Closing database connection...');
        await sequelize.close();
        console.log('Database connection closed.');
    });

    beforeEach(async () => {
        console.log('Clearing database...');
        await sequelize.sync({ force: true });
        console.log('Database cleared.');
    });

    it('should create a valid message', async () => {
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

        const message = await Message.create({
            senderId: sender.id,
            recipientId: recipient.id,
            content: 'Hello from the shadow realm!',
            cryptoTip: 0.5,
        });

        expect(message).toBeDefined();
        expect(message.content).toBe('Hello from the shadow realm!');
        expect(message.cryptoTip).toBe(0.5);
        expect(message.read).toBe(false);
        expect(message.senderId).toBe(sender.id);
        expect(message.recipientId).toBe(recipient.id);
    });

    it('should enforce content length validation', async () => {
        const sender = await User.create({
            username: 'DarkPhoenix',
            email: 'darkphoenix@example.com',
            password: 'burning_darkness',
            walletAddress: '47qshMp8kzQ9KERnUHsoJyyVpq3BgPjq77VZbL6n8evj',
        });
        const recipient = await User.create({
            username: 'ShadowDancer',
            email: 'shadowdancer@example.com',
            password: 'dancing_void',
            walletAddress: 'A6MejruMiawCJTGxn5rj6Qz8prZjkXbR6zHcgWZmsAGn',
        });

        await expect(
            Message.create({
                senderId: sender.id,
                recipientId: recipient.id,
                content: '', // Invalid content length
                cryptoTip: 0.1,
            })
        ).rejects.toThrow(/Message content must be between 1 and 500 characters/);
    });

    it('should enforce non-negative crypto tips', async () => {
        const sender = await User.create({
            username: 'SolsticeReaper',
            email: 'solsticereaper@example.com',
            password: 'sol_reaper666',
            walletAddress: '8PFC24NTZriQVrE4Rpsj9utZNXUynNzofwuYqkLYy6tP',
        });
        const recipient = await User.create({
            username: 'MoonlitGoth',
            email: 'moonlitgoth@example.com',
            password: 'moon_shadow123',
            walletAddress: '47qshMp8kzQ9KERnUHsoJyyVpq3BgPjq77VZbL6n8evj',
        });

        await expect(
            Message.create({
                senderId: sender.id,
                recipientId: recipient.id,
                content: 'Negative tips are not allowed.',
                cryptoTip: -1.0, // Invalid negative tip
            })
        ).rejects.toThrow(/CryptoTip cannot be negative/);
    });

    it('should set the message as read and update the readAt timestamp', async () => {
        const sender = await User.create({
            username: 'Nightshade',
            email: 'nightshade@example.com',
            password: 'shade_of_night',
            walletAddress: 'A6MejruMiawCJTGxn5rj6Qz8prZjkXbR6zHcgWZmsAGn',
        });
        const recipient = await User.create({
            username: 'TwilightCrypt',
            email: 'twilightcrypt@example.com',
            password: 'twilight_crypt',
            walletAddress: '8PFC24NTZriQVrE4Rpsj9utZNXUynNzofwuYqkLYy6tP',
        });

        const message = await Message.create({
            senderId: sender.id,
            recipientId: recipient.id,
            content: 'Mark me as read!',
            cryptoTip: 0.0,
        });

        expect(message.read).toBe(false);
        expect(message.readAt).toBeNull();

        message.read = true;
        message.readAt = new Date();
        await message.save();

        const updatedMessage = await Message.findByPk(message.id);
        expect(updatedMessage.read).toBe(true);
        expect(updatedMessage.readAt).toBeInstanceOf(Date);
    });

    it('should establish correct sender and recipient associations', async () => {
        const sender = await User.create({
            username: 'VampireCrypt',
            email: 'vampirecrypt@example.com',
            password: 'crypt_blood123',
            walletAddress: '47qshMp8kzQ9KERnUHsoJyyVpq3BgPjq77VZbL6n8evj',
        });
        const recipient = await User.create({
            username: 'GhostlyEcho',
            email: 'ghostlyecho@example.com',
            password: 'echo_spectral',
            walletAddress: '8PFC24NTZriQVrE4Rpsj9utZNXUynNzofwuYqkLYy6tP',
        });

        const message = await Message.create({
            senderId: sender.id,
            recipientId: recipient.id,
            content: 'Testing associations.',
            cryptoTip: 0.1,
        });

        const foundMessage = await Message.findByPk(message.id, {
            include: [
                { model: User, as: 'sender' },
                { model: User, as: 'recipient' },
            ],
        });

        expect(foundMessage.sender.username).toBe('VampireCrypt');
        expect(foundMessage.recipient.username).toBe('GhostlyEcho');
    });
});
