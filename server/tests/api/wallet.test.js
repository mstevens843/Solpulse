const request = require('supertest');
const app = require('../../app'); // Adjust path based on your app structure
const { sequelize, Wallet, User } = require('../../models/Index');
const jwt = require('jsonwebtoken');

// Mocking middleware and utilities
jest.mock('../../middleware/auth', () =>
    jest.fn((req, res, next) => {
        req.user = { id: 1 }; // Mock authenticated user
        next();
    })
);

jest.mock('../../utils/solana', () => ({
    getWalletBalance: jest.fn().mockResolvedValue(10.0), // Mock getWalletBalance function
}));

let authToken;
let testUser;

beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create test user
    testUser = await User.create({
        username: 'testuserwoah',
        email: 'testuserwoah@example.com',
        password: 'password123546!',
        walletAddress: '5zHovqtNc4hajkTxdrBSuaN54pTpMcuGxjc5F9WEpoFc',
    });

    // Generate auth token dynamically
    authToken = `Bearer ${jwt.sign({ id: testUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' })}`;
});

afterEach(async () => {
    // Clear Wallet table after each test to ensure isolation
    await Wallet.destroy({ where: {} });
});

afterAll(async () => {
    await sequelize.close();
});

describe('Wallet API', () => {
    it('should add a new wallet successfully', async () => {
        const walletAddress = '5jEwb3jgPK1KeLNo7ouaAZ28RjNu6NTvrjzHsRxpW1VN';

        const res = await request(app)
            .post('/api/wallet')
            .set('Authorization', authToken)
            .send({ address: walletAddress });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Wallet added successfully');
        expect(res.body.wallet).toHaveProperty('address', walletAddress);
        expect(res.body.wallet).toHaveProperty('userId', testUser.id);
    });

    it('should not allow adding a wallet with an existing address', async () => {
        const walletAddress = '5jEwb3jgPK1KeLNo7ouaAZ28RjzHsRxpW1VN';

        // Ensure the wallet is created directly
        await Wallet.findOrCreate({
            where: { address: walletAddress },
            defaults: { userId: testUser.id },
        });

        const res = await request(app)
            .post('/api/wallet')
            .set('Authorization', authToken)
            .send({ address: walletAddress });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Wallet already exists');
    });

    it('should fetch all wallets for the authenticated user', async () => {
        const validWallets = [
            { userId: testUser.id, address: '47qshMp8kzQ9KERnUHsoJyyVpq3BgPjq77VZbL6n8evj' },
            { userId: testUser.id, address: '7Pjo8PZzC8cqufpHhBGiFdGkLCHGZTKPtxXkyAtyCph2' },
        ];
        await Wallet.bulkCreate(validWallets);

        const res = await request(app)
            .get('/api/wallet')
            .set('Authorization', authToken);

        expect(res.status).toBe(200);
        expect(res.body.wallets.length).toBe(validWallets.length);
        expect(res.body.wallets).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ address: validWallets[0].address }),
                expect.objectContaining({ address: validWallets[1].address }),
            ])
        );
    });

    it('should return an error if no wallets are found for the authenticated user', async () => {
        const res = await request(app)
            .get('/api/wallet')
            .set('Authorization', authToken);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('No wallets found for this user.');
    });

    it('should get the wallet balance and transactions', async () => {
        const walletAddress = '47qshMp8kzQ9KERnUHsoJyyVpq3BgPjq77VZbL6n8evj';

        const res = await request(app)
            .get(`/api/wallet/balance/${walletAddress}`)
            .set('Authorization', authToken);

        expect(res.status).toBe(200);
        expect(res.body.address).toBe(walletAddress);
        expect(res.body.balance).toBe(10.0);
        expect(res.body.transactions).toBeInstanceOf(Array);
    });

    it('should return an error if the wallet address is invalid', async () => {
        const invalidAddress = 'invalid_wallet_address';

        const res = await request(app)
            .get(`/api/wallet/balance/${invalidAddress}`)
            .set('Authorization', authToken);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Invalid wallet address');
    });
});