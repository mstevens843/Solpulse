'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Fetch existing IDs for users and posts
    const users = await queryInterface.sequelize.query(`SELECT id FROM "Users";`);
    const posts = await queryInterface.sequelize.query(`SELECT id FROM "Posts";`);

    const userRows = users[0];
    const postRows = posts[0];

    if (userRows.length === 0 || postRows.length === 0) {
      console.warn('No users or posts found. Skipping test comment seeding.');
      return;
    }

    // Add test comments only
    await queryInterface.bulkInsert('Comments', [
      {
        userId: userRows[0].id,
        postId: postRows[0].id,
        content: 'Temporary test comment for post 1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove only the test comment
    await queryInterface.bulkDelete('Comments', {
      content: 'Temporary test comment for post 1',
    });
  },
};
