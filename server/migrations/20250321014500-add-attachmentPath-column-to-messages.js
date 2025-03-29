'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Messages", "attachmentPath", {
      type: Sequelize.STRING,
      allowNull: true, // Optional field, for messages that don't have attachments
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Messages", "attachmentPath");
  },
};
