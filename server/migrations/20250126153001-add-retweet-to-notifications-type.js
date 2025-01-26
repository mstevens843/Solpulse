'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Notifications_type" ADD VALUE 'retweet';
    `);
  },

  async down(queryInterface, Sequelize) {
    // Down method to revert changes
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_Notifications_type_temp" AS ENUM('like', 'comment', 'follow', 'transaction', 'message');
      ALTER TABLE "Notifications" ALTER COLUMN "type" TYPE "enum_Notifications_type_temp" USING "type"::text::"enum_Notifications_type_temp";
      DROP TYPE "enum_Notifications_type";
      ALTER TYPE "enum_Notifications_type_temp" RENAME TO "enum_Notifications_type";
    `);
  }
};
