'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const existingUsers = await queryInterface.sequelize.query(
      `SELECT "walletAddress" FROM "Users";`
    );
    const existingAddresses = existingUsers[0].map((user) => user.walletAddress);

    const usersToInsert = [
      {
        id: 3, // Explicitly set the ID to avoid conflict
        username: 'crypto_pro',
        email: 'crypto.pro@example.com',
        password: 'hashedpassword123',
        walletAddress: 'B3ckPwK18yVL4FD0bZG2UgHZ9j0Ndp5Zyz',
        bio: 'Crypto enthusiast.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        username: 'btc_master',
        email: 'btc.master@example.com',
        password: 'hashedpassword456',
        walletAddress: 'CxBkX9MRgvcdLdVFG4XtyV9jtMxPLZR2Bo',
        bio: 'Bitcoin evangelist.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        username: 'eth_fan',
        email: 'eth.fan@example.com',
        password: 'hashedpassword789',
        walletAddress: 'AxY7PwJ4KLpFdL2F9b5ZLgB9Ndp5ZJpXpK',
        bio: 'Ethereum supporter.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 6,
        username: 'doge_lover',
        email: 'doge.lover@example.com',
        password: 'hashedpassword101',
        walletAddress: 'Dx8ZWXKY4FdV3ZG9F2Bg1MpL9JpXpYZ5d',
        bio: 'Much wow.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 7,
        username: 'polygon_supporter',
        email: 'polygon.supporter@example.com',
        password: 'hashedpassword111',
        walletAddress: 'F3kYPK94KL2VF9b5ZLg1MpJpXZ5LdVJXpK',
        bio: 'Scaling Ethereum.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 8,
        username: 'solana_fanatic',
        email: 'solana.fanatic@example.com',
        password: 'hashedpassword121',
        walletAddress: 'Hx5BKML7ZG2VF3KXp9JpXZ5L9LgBKYL5Fp',
        bio: 'Solana to the moon.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 9,
        username: 'litecoin_king',
        email: 'litecoin.king@example.com',
        password: 'hashedpassword131',
        walletAddress: 'J9BK8WL6KXp9BZ5BK9YMdV3K8WL9MpXFpJ',
        bio: 'Litecoin for payments.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 10,
        username: 'cardano_guru',
        email: 'cardano.guru@example.com',
        password: 'hashedpassword141',
        walletAddress: 'L2F9MpL6KXp9BZ5BK9YMdV3K8WL9MpXFpB',
        bio: 'Cardano believer.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ].filter((user) => !existingAddresses.includes(user.walletAddress));

    if (usersToInsert.length > 0) {
      await queryInterface.bulkInsert('Users', usersToInsert);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', { id: { [Sequelize.Op.gte]: 3 } });
  },
};
