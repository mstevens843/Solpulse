'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Notifications_type" ADD VALUE 'follow-request';
    `);
  },

  async down(queryInterface, Sequelize) {
    console.log('🚫 Cannot revert enum value addition.');
  },
};