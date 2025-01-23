'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Fetch existing user IDs
    const users = await queryInterface.sequelize.query(`SELECT id FROM "Users";`);
    const userRows = users[0];

    if (userRows.length === 0) {
      console.warn('No users found. Skipping post seeding.');
      return;
    }

    // Use existing user IDs for posts
    const posts = [
      {
        userId: userRows[0].id, // Use the first available user ID
        content: 'Excited to be part of the blockchain revolution!',
        mediaUrl: null,
        cryptoTag: 'BTC',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ];

    if (userRows.length > 1) {
      posts.push({
        userId: userRows[1].id, // Use the second available user ID if it exists
        content: 'Solana transactions are lightning fast!',
        mediaUrl: null,
        cryptoTag: 'SOL',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
    }

    await queryInterface.bulkInsert('Posts', posts);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Posts', null, {});
  },
};
