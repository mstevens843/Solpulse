'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Tips', [
      { fromUserId: 1, toUserId: 2, amount: 0.1, message: 'Thanks for your insights!', createdAt: new Date(), updatedAt: new Date() },
      { fromUserId: 2, toUserId: 3, amount: 0.2, message: 'Great work!', createdAt: new Date(), updatedAt: new Date() },
      { fromUserId: 3, toUserId: 4, amount: 0.15, message: 'Loved your post!', createdAt: new Date(), updatedAt: new Date() },
      { fromUserId: 4, toUserId: 5, amount: 0.05, message: 'Keep it up!', createdAt: new Date(), updatedAt: new Date() },
      { fromUserId: 5, toUserId: 6, amount: 0.3, message: 'Great content!', createdAt: new Date(), updatedAt: new Date() },
      { fromUserId: 6, toUserId: 7, amount: 0.1, message: 'Super helpful!', createdAt: new Date(), updatedAt: new Date() },
      { fromUserId: 7, toUserId: 8, amount: 0.25, message: 'Thanks for your guidance!', createdAt: new Date(), updatedAt: new Date() },
      { fromUserId: 8, toUserId: 1, amount: 0.4, message: 'Very useful!', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Tips', null, {});
  },
};
