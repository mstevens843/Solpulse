'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await queryInterface.sequelize.query(`SELECT id FROM "Users";`);
    const posts = await queryInterface.sequelize.query(`SELECT id FROM "Posts";`);

    const [userRows] = users;
    const [postRows] = posts;

    if (userRows.length === 0 || postRows.length === 0) {
      console.warn('No users or posts found. Skipping comment seeding.');
      return;
    }

    const comments = [
      {
        userId: userRows[0].id,
        postId: postRows[0].id,
        content: 'This is a great post!',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Add a second comment if more users/posts are available
    if (userRows.length > 1 && postRows.length > 1) {
      comments.push({
        userId: userRows[1].id,
        postId: postRows[1].id,
        content: 'I completely agree!',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await queryInterface.bulkInsert('Comments', comments);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Comments', null, {});
  },
};


