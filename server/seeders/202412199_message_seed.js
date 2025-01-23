'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Messages', [
      { senderId: 1, recipientId: 2, content: 'Recent message 1', cryptoTip: 0.0, read: false, createdAt: new Date(), updatedAt: new Date() },
      { senderId: 1, recipientId: 2, content: 'Recent message 2', cryptoTip: 0.0, read: false, createdAt: new Date(), updatedAt: new Date() },
      { senderId: 3, recipientId: 4, content: 'Hello from crypto_pro!', cryptoTip: 0.1, read: true, createdAt: new Date(), updatedAt: new Date() },
      { senderId: 5, recipientId: 6, content: 'Ethereum is trending!', cryptoTip: 0.5, read: false, createdAt: new Date(), updatedAt: new Date() },
      { senderId: 2, recipientId: 1, content: 'Message for user 1', cryptoTip: 0.2, read: false, createdAt: new Date(), updatedAt: new Date() },
      { senderId: 1, recipientId: 2, content: 'Hello, recipient!', cryptoTip: 0.5, read: false, createdAt: new Date(), updatedAt: new Date() },
      { senderId: 1, recipientId: 2, content: 'Another recent message', cryptoTip: 0.5, read: false, createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Messages', null, {});
  },
};

