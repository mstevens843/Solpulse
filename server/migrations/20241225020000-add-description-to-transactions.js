'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Transactions', 'description', {
      type: Sequelize.STRING,
      allowNull: true, // Allow null since this is an optional field
      validate: {
        len: [0, 255], // Ensure the description is not too long
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Transactions', 'description');
  },
};
