const request = require('supertest');
const app = require('../../app');
const { sequelize, User } = require('../../models');
const jwt = require('jsonwebtoken');
jest.mock('axios');
require('dotenv').config();

describe('Crypto Trade API', () => {
    let user, token;

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        user = await User.create({
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
            walletAddress: '7Pjo8PZzC8cqufpHhBGiFdGkLCHGZTKPtxXkyAtyCph2',
        });

        token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('POST /api/trade', () => {
        it('should successfully execute a buy trade', async () => {
            const mockResponse = {
                data: {
                    trade: {
                        type: 'buy',
                        amount: 0.01,
                        currency: 'BTC',
                        status: 'success',
                        tradeId: 'mock123456789',
                        timestamp: new Date().toISOString(),
                    },
                },
            };

            require('axios').post.mockResolvedValue(mockResponse);

            const res = await request(app)
                .post('/api/trade')
                .set('Authorization', `Bearer ${token}`)
                .send({ cryptoType: 'BTC', amount: 0.01, tradeType: 'buy' });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Successfully executed buy of 0.01 BTC.');
            expect(res.body.tradeDetails).toEqual(
                expect.objectContaining({
                    type: 'buy',
                    amount: 0.01,
                    currency: 'BTC',
                    status: 'success',
                    tradeId: 'mock123456789',
                })
            );
        });

        it('should successfully execute a sell trade', async () => {
            const mockResponse = {
                data: {
                    trade: {
                        type: 'sell',
                        amount: 0.1,
                        currency: 'ETH',
                        status: 'success',
                        tradeId: 'mock123456789',
                        timestamp: new Date().toISOString(),
                    },
                },
            };

            require('axios').post.mockResolvedValue(mockResponse);

            const res = await request(app)
                .post('/api/trade')
                .set('Authorization', `Bearer ${token}`)
                .send({ cryptoType: 'ETH', amount: 0.1, tradeType: 'sell' });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Successfully executed sell of 0.1 ETH.');
            expect(res.body.tradeDetails).toEqual(
                expect.objectContaining({
                    type: 'sell',
                    amount: 0.1,
                    currency: 'ETH',
                    status: 'success',
                    tradeId: 'mock123456789',
                })
            );
        });

        it('should fail if cryptoType is missing', async () => {
            const res = await request(app)
                .post('/api/trade')
                .set('Authorization', `Bearer ${token}`)
                .send({ amount: 0.01, tradeType: 'buy' });

            expect(res.status).toBe(400);
            expect(res.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: 'Crypto type is required' }),
                ])
            );
        });

        it('should fail if amount is invalid', async () => {
            const res = await request(app)
                .post('/api/trade')
                .set('Authorization', `Bearer ${token}`)
                .send({ cryptoType: 'BTC', amount: -1, tradeType: 'buy' });

            expect(res.status).toBe(400);
            expect(res.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: 'Amount must be a positive number' }),
                ])
            );
        });

        it('should fail if tradeType is invalid', async () => {
            const res = await request(app)
                .post('/api/trade')
                .set('Authorization', `Bearer ${token}`)
                .send({ cryptoType: 'BTC', amount: 0.01, tradeType: 'invalid' });

            expect(res.status).toBe(400);
            expect(res.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: 'Trade type must be either "buy" or "sell"' }),
                ])
            );
        });

        it('should handle Coinbase API failure', async () => {
            const mockError = {
                response: {
                    status: 500,
                    data: { message: 'Coinbase API error' },
                },
            };
        
            require('axios').post.mockRejectedValueOnce(mockError);
        
            const res = await request(app)
                .post('/api/trade')
                .set('Authorization', `Bearer ${token}`)
                .send({ cryptoType: 'BTC', amount: 0.01, tradeType: 'buy' });
        
            console.log('Response status:', res.status); // Debug log
            console.log('Response body:', res.body); // Debug log
        
            expect(res.status).toBe(500);
            expect(res.body.message).toBe('An unexpected error occurred while executing the trade.');
            expect(res.body.error).toBe('Coinbase API error');
        });
        
        
    });
});




// Key Aspects:
// Setup and Cleanup:

// Resets the database using sequelize.sync({ force: true }) before each test and closes the database connection after all tests.
// Successful Trade Test:

// Tests for successful execution of both buy and sell trades.
// Input Validation:

// Tests for missing or invalid cryptoType, amount, and tradeType.
// Coinbase API Error Handling:

// Simulates errors from the Coinbase API by testing the error handling in case of failures.
