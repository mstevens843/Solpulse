'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Posts', 'originalAuthor', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Posts', 'originalProfilePicture', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Posts', 'originalAuthor');
    await queryInterface.removeColumn('Posts', 'originalProfilePicture');
  }
};
