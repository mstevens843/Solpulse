'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Notifications', [
      { userId: 1, actorId: 2, type: 'follow', message: 'recipient started following you!', isRead: false, createdAt: new Date(), updatedAt: new Date() },
      { userId: 3, actorId: 4, type: 'message', message: 'eth_fan sent you a message!', isRead: true, createdAt: new Date(), updatedAt: new Date() },
      { userId: 5, actorId: 6, type: 'comment', message: 'doge_lover commented on your post!', isRead: false, createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Notifications', null, {});
  },
};
