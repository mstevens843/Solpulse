'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
      await queryInterface.addColumn('MessageRequests', 'message', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    },
  
    async down(queryInterface, Sequelize) {
      await queryInterface.removeColumn('MessageRequests', 'message');
    },
  };