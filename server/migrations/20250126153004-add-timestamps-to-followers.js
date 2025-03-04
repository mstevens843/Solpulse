'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {


    await queryInterface.addColumn('Followers', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('NOW()'),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Followers', 'updatedAt');
  }
};
