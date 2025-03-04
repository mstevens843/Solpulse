'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 1: Rename the corrupted enum
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Notifications_type" RENAME TO "enum_Notifications_type_old";
    `);

    // Step 2: Recreate the enum with the correct values
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_Notifications_type" AS ENUM ('like', 'comment', 'follow', 'transaction', 'message');
    `);

    // Step 3: Update the column to use the new enum
    await queryInterface.sequelize.query(`
      ALTER TABLE "Notifications"
      ALTER COLUMN "type" TYPE "enum_Notifications_type"
      USING "type"::text::"enum_Notifications_type";
    `);

    // Step 4: Drop the old enum
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_Notifications_type_old";
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // NOTE: Down migrations cannot fully reverse this process.
    // Recreate the original enum without 'message'.
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Notifications_type" RENAME TO "enum_Notifications_type_old";
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_Notifications_type" AS ENUM ('like', 'comment', 'follow', 'transaction');
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "Notifications"
      ALTER COLUMN "type" TYPE "enum_Notifications_type"
      USING "type"::text::"enum_Notifications_type";
    `);

    await queryInterface.sequelize.query(`
      DROP TYPE "enum_Notifications_type_old";
    `);
  },
};
