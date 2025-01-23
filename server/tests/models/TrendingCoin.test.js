const db = require('../../models'); // Import the models directory
const { TrendingCoin } = db; // Extract TrendingCoin model
const sequelize = db.sequelize; // Extract sequelize instance

describe('TrendingCoin Model', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true }); // Ensure the database is clean
    });

    afterAll(async () => {
        await sequelize.close(); // Close the Sequelize connection
    });

    it('should create a TrendingCoin successfully', async () => {
        const coin = await TrendingCoin.create({
            id: 'bitcoin',
            name: 'Bitcoin',
            symbol: 'BTC',
            currentPrice: 50000,
            lastUpdated: new Date(),
        });

        expect(coin.id).toBe('bitcoin');
        expect(coin.name).toBe('Bitcoin');
        expect(coin.symbol).toBe('BTC');
        expect(coin.currentPrice).toBe(50000);
        expect(coin.lastUpdated).toBeDefined();
    });

    it('should throw an error if id is missing', async () => {
        await expect(
            TrendingCoin.create({
                name: 'Ethereum',
                symbol: 'ETH',
                currentPrice: 3500,
                lastUpdated: new Date(),
            })
        ).rejects.toThrow(/null value in column "id" of relation "TrendingCoins" violates not-null constraint/);
    });
    
    

    it('should throw an error if name is missing', async () => {
        await expect(
            TrendingCoin.create({
                id: 'ethereum',
                symbol: 'ETH',
                currentPrice: 3500,
                lastUpdated: new Date(),
            })
        ).rejects.toThrow(/notNull Violation: TrendingCoin.name cannot be null/);
    });

    it('should throw an error if symbol is missing', async () => {
        await expect(
            TrendingCoin.create({
                id: 'ethereum',
                name: 'Ethereum',
                currentPrice: 3500,
                lastUpdated: new Date(),
            })
        ).rejects.toThrow(/notNull Violation: TrendingCoin.symbol cannot be null/);
    });

    it('should throw an error if currentPrice is missing', async () => {
        await expect(
            TrendingCoin.create({
                id: 'ethereum',
                name: 'Ethereum',
                symbol: 'ETH',
                lastUpdated: new Date(),
            })
        ).rejects.toThrow(/notNull Violation: TrendingCoin.currentPrice cannot be null/);
    });

    it('should throw an error if lastUpdated is missing', async () => {
        await expect(
            TrendingCoin.create({
                id: 'ethereum',
                name: 'Ethereum',
                symbol: 'ETH',
                currentPrice: 3500,
            })
        ).rejects.toThrow(/notNull Violation: TrendingCoin.lastUpdated cannot be null/);
    });

    it('should enforce unique id', async () => {
        await TrendingCoin.create({
            id: 'dogecoin',
            name: 'Dogecoin',
            symbol: 'DOGE',
            currentPrice: 0.3,
            lastUpdated: new Date(),
        });

        await expect(
            TrendingCoin.create({
                id: 'dogecoin', // Duplicate id
                name: 'Duplicate Dogecoin',
                symbol: 'DOGE2',
                currentPrice: 0.5,
                lastUpdated: new Date(),
            })
        ).rejects.toThrow(/Validation error/);
    });
});

