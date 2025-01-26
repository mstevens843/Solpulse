'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Followers', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('NOW()'),
    });

    await queryInterface.addColumn('Followers', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('NOW()'),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Followers', 'createdAt');
    await queryInterface.removeColumn('Followers', 'updatedAt');
  }
};
