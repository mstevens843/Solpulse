'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Fetch existing users to ensure valid userId references
    const users = await queryInterface.sequelize.query(
      `SELECT "id" FROM "Users" ORDER BY "id";`
    );
    const userIds = users[0].map((user) => user.id);

    if (userIds.length < 8) {
      throw new Error('Insufficient users in "Users" table to seed Wallets.');
    }

    const walletsToInsert = [
      { userId: userIds[0], address: 'B3ckPwK18yVL4FD0bZG2UgHZ9j0Ndp5Zyz', balance: 5.0 },
      { userId: userIds[1], address: 'CxBkX9MRgvcdLdVFG4XtyV9jtMxPLZR2Bo', balance: 3.0 },
      { userId: userIds[2], address: 'AxY7PwJ4KLpFdL2F9b5ZLgB9Ndp5ZJpXpK', balance: 7.5 },
      { userId: userIds[3], address: 'Dx8ZWXKY4FdV3ZG9F2Bg1MpL9JpXpYZ5d', balance: 6.5 },
      { userId: userIds[4], address: 'F3kYPK94KL2VF9b5ZLg1MpJpXZ5LdVJXpK', balance: 4.0 },
      { userId: userIds[5], address: 'Hx5BKML7ZG2VF3KXp9JpXZ5L9LgBKYL5Fp', balance: 2.8 },
      { userId: userIds[6], address: 'J9BK8WL6KXp9BZ5BK9YMdV3K8WL9MpXFpJ', balance: 3.4 },
      { userId: userIds[7], address: 'L2F9MpL6KXp9BZ5BK9YMdV3K8WL9MpXFpB', balance: 7.1 },
    ];

    // Remove wallets with duplicate addresses
    const existingWallets = await queryInterface.sequelize.query(
      `SELECT "address" FROM "Wallets";`
    );
    const existingAddresses = existingWallets[0].map((wallet) => wallet.address);

    const uniqueWallets = walletsToInsert.filter(
      (wallet) => !existingAddresses.includes(wallet.address)
    );

    if (uniqueWallets.length > 0) {
      await queryInterface.bulkInsert('Wallets', uniqueWallets.map((wallet) => ({
        ...wallet,
        createdAt: new Date(),
        updatedAt: new Date(),
      })));
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Wallets', null, {});
  },
};
