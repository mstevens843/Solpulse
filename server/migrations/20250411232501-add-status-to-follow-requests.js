'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('FollowRequests', 'status', {
      type: Sequelize.ENUM('pending', 'accepted', 'denied'),
      allowNull: false,
      defaultValue: 'pending',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('FollowRequests', 'status');
  }
};
