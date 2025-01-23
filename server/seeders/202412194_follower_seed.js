'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Followers', [
      {
        followerId: 1,
        followingId: 2,
      },
      {
        followerId: 2,
        followingId: 1,
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Followers', null, {});
  },
};
