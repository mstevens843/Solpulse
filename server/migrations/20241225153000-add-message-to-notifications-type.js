'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

  },

  async down(queryInterface, Sequelize) {
    // Down method to revert changes
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_Notifications_type_temp" AS ENUM('other_existing_values');
      ALTER TABLE "Notifications" ALTER COLUMN "type" TYPE "enum_Notifications_type_temp" USING "type"::text::"enum_Notifications_type_temp";
      DROP TYPE "enum_Notifications_type";
      ALTER TYPE "enum_Notifications_type_temp" RENAME TO "enum_Notifications_type";
    `);
  }
};
