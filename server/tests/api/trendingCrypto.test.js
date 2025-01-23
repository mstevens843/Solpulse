const request = require('supertest');
const app = require('../../app'); // Adjust the path based on your app's location
jest.mock('axios'); // Mock axios to avoid real API calls

describe('GET /api/trendingCrypto', () => {
    it('should fetch trending coins in the Solana ecosystem', async () => {
        const mockData = [
            { id: 'solana', name: 'Solana', symbol: 'SOL', current_price: 150, market_cap: 45000000000 },
            { id: 'raydium', name: 'Raydium', symbol: 'RAY', current_price: 10, market_cap: 500000000 },
        ];

        require('axios').get.mockResolvedValue({ data: mockData });

        const response = await request(app).get('/api/trendingCrypto');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockData);
    });

    it('should return an error if no trending coins are found', async () => {
        require('axios').get.mockResolvedValue({ data: [] });

        const response = await request(app).get('/api/trendingCrypto');
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('No trending coins found for Solana ecosystem');
    });

    it('should return a 500 error if the CoinGecko API call fails', async () => {
        require('axios').get.mockRejectedValue(new Error('CoinGecko API error'));

        const response = await request(app).get('/api/trendingCrypto');
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to fetch trending coins');
    });

    it('should return a specific error message if CoinGecko API responds with an error', async () => {
        require('axios').get.mockRejectedValue({
            response: { status: 400, data: { error: 'Bad request' } },
        });

        const response = await request(app).get('/api/trendingCrypto');
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('CoinGecko API error: Bad request');
    });

    it('should handle an undefined response gracefully', async () => {
        require('axios').get.mockResolvedValue(undefined);

        const response = await request(app).get('/api/trendingCrypto');
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to fetch trending coins');
    });

    it('should log appropriate messages', async () => {
        const mockData = [
            { id: 'solana', name: 'Solana', symbol: 'SOL', current_price: 150, market_cap: 45000000000 },
        ];

        const logSpy = jest.spyOn(console, 'log').mockImplementation();
        require('axios').get.mockResolvedValue({ data: mockData });

        const response = await request(app).get('/api/trendingCrypto');
        expect(response.status).toBe(200);

        expect(logSpy).toHaveBeenCalledWith('GET /api/trending route hit');
        expect(logSpy).toHaveBeenCalledWith('Received response from CoinGecko API');

        logSpy.mockRestore();
    });
});

