'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Messages", "notificationId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Notifications",
        key: "id"
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE"
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Messages", "notificationId");
  },
};
