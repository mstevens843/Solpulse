'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Transactions', 'referenceId', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true, // Ensure no duplicate reference IDs
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Transactions', 'referenceId');
  },
};
