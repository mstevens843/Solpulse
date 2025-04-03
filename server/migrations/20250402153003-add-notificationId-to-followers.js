'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Followers', 'notificationId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Notifications',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Followers', 'notificationId');
  },
};