'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('FollowRequests', 'notificationId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Notifications',
        key: 'id',
      },
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('FollowRequests', 'notificationId');
  },
};
