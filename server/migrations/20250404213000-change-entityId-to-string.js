'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Notifications", "entityId", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Notifications", "entityId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
};
