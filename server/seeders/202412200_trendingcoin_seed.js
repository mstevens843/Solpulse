'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('TrendingCoins', [
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'BTC',
        currentPrice: 56000, // Example price in USD
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'solana',
        name: 'Solana',
        symbol: 'SOL',
        currentPrice: 150, // Example price in USD
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ethereum',
        name: 'Ethereum',
        symbol: 'ETH',
        currentPrice: 4000, // Example price in USD
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('TrendingCoins', null, {});
  },
};
