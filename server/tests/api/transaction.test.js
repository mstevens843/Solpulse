const request = require('supertest');
const { sequelize, Transaction, Wallet, User } = require('../../models/Index');
const jwt = require('jsonwebtoken');
const app = require('../../app');

describe('Transaction Routes', () => {
    let user, wallet, token;

    beforeAll(async () => {
        await sequelize.sync({ force: true }); // Reset the database before tests

        // Create a test user
        user = await User.create({
            username: 'testuserscooba',
            email: 'testuserscooba@example.com',
            password: 'password123scooba',
            walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        });

        // Create a wallet for the user
        wallet = await Wallet.create({
            userId: user.id,
            address: user.walletAddress,
        });

        // Generate a JWT token for the user
        token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    beforeEach(async () => {
        // Clear transactions before each test to avoid duplicates
        await Transaction.destroy({ where: {} });
    });

    afterAll(async () => {
        await sequelize.close(); // Close the database connection after tests
    });

    describe('GET /api/transactions/wallet/:walletAddress', () => {
        it('should fetch all transactions for a specific wallet address', async () => {
            const transaction = await Transaction.create({
                walletId: wallet.id,
                userId: user.id,
                walletAddress: wallet.address,
                amount: 100.0,
                type: 'deposit',
            });

            const res = await request(app)
                .get(`/api/transactions/wallet/${wallet.address}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(res.body.transactions).toHaveLength(1);
            expect(res.body.transactions[0].amount).toBe(transaction.amount);
        });

        it('should return 404 if the wallet does not exist', async () => {
            const res = await request(app)
                .get('/api/transactions/wallet/nonexistentwallet')
                .set('Authorization', `Bearer ${token}`)
                .expect(404);

            expect(res.body.error).toBe('Wallet not found');
        });
    });

    describe('GET /api/transactions', () => {
        it('should fetch all transactions for the authenticated user\'s wallets', async () => {
            const transaction = await Transaction.create({
                walletId: wallet.id,
                userId: user.id,
                walletAddress: wallet.address,
                amount: 100.0,
                type: 'deposit',
            });

            const res = await request(app)
                .get('/api/transactions')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(res.body.transactions).toHaveLength(1);
            expect(res.body.transactions[0].amount).toBe(transaction.amount);
        });

        it('should return 404 if no wallets are found for the user', async () => {
            await Wallet.destroy({ where: { userId: user.id } }); // Remove user's wallet

            const res = await request(app)
                .get('/api/transactions')
                .set('Authorization', `Bearer ${token}`)
                .expect(404);

            expect(res.body.error).toBe('No wallets found for the user.');
        });
    });

    describe('POST /api/transactions', () => {
        it('should add a new transaction (deposit)', async () => {
            const newTransaction = {
                walletId: wallet.id,
                amount: 50.0,
                type: 'deposit',
            };
        
            console.log('Token:', token);
            console.log('Payload:', newTransaction);
        
            const res = await request(app)
                .post('/api/transactions')
                .set('Authorization', `Bearer ${token}`)
                .send(newTransaction)
                .expect(201);
        
            expect(res.body.transaction.amount).toBe(newTransaction.amount);
            expect(res.body.transaction.type).toBe(newTransaction.type);
        });
        

        it('should reject transaction with invalid wallet ID', async () => {
            const newTransaction = {
                walletId: 9999, // Non-existent wallet
                amount: 50.0,
                type: 'deposit',
            };

            const res = await request(app)
                .post('/api/transactions')
                .set('Authorization', `Bearer ${token}`)
                .send(newTransaction)
                .expect(403);

            expect(res.body.error).toBe('Unauthorized or wallet not found');
        });

        it('should reject transaction with invalid amount', async () => {
            const newTransaction = {
                walletId: wallet.id,
                amount: -50.0, // Invalid amount
                type: 'deposit',
            };

            const res = await request(app)
                .post('/api/transactions')
                .set('Authorization', `Bearer ${token}`)
                .send(newTransaction)
                .expect(400);

            expect(res.body.errors[0].msg).toBe('Amount must be a positive number');
        });

        it('should reject transaction with invalid type', async () => {
            const newTransaction = {
                walletId: wallet.id,
                amount: 50.0,
                type: 'invalid', // Invalid type
            };

            const res = await request(app)
                .post('/api/transactions')
                .set('Authorization', `Bearer ${token}`)
                .send(newTransaction)
                .expect(400);

            expect(res.body.errors[0].msg).toBe('Transaction type must be "deposit" or "withdrawal"');
        });
    });
});


