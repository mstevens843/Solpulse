'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Fetch wallets from the database
    const wallets = await queryInterface.sequelize.query(
      `SELECT "id", "address", "userId" FROM "Wallets";`
    );
    const [walletRows] = wallets;

    if (walletRows.length === 0) {
      throw new Error('No wallets found in "Wallets" table to seed Transactions.');
    }

    // Generate 50 transactions
    const transactions = [];
    for (let i = 0; i < 50; i++) {
      const wallet = walletRows[i % walletRows.length]; // Cycle through wallets
      transactions.push({
        userId: wallet.userId, // Link transaction to wallet's userId
        walletId: wallet.id, // Link transaction to walletId
        walletAddress: wallet.address, // Ensure walletAddress is populated
        amount: parseFloat((Math.random() * 10).toFixed(2)), // Random amount between 0 and 10
        type: i % 2 === 0 ? 'deposit' : 'withdrawal', // Alternate between deposit and withdrawal
        status: i % 3 === 0 ? 'pending' : 'completed', // Alternate statuses
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await queryInterface.bulkInsert('Transactions', transactions);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Transactions', null, {});
  },
};
