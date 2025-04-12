'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Notifications_type" ADD VALUE 'message-request';
    `);
  },

  async down(queryInterface, Sequelize) {
    // No downgrade for enum change
    console.log("🚫 Cannot revert enum value addition.");
  },
};
