'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const newEnumValues = ['mention', 'share', 'rest']; // Add all needed enum values here

    for (const value of newEnumValues) {
      const enumExists = await queryInterface.sequelize.query(`
        SELECT 1 
        FROM pg_enum 
        WHERE enumlabel = '${value}' 
          AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_Notifications_type');
      `);

      // Add value only if it doesn't exist
      if (enumExists[0].length === 0) {
        await queryInterface.sequelize.query(`
          ALTER TYPE "enum_Notifications_type" ADD VALUE '${value}';
        `);
        console.log(`Added enum value: ${value}`);
      } else {
        console.log(`Enum value '${value}' already exists. Skipping.`);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.warn('Cannot remove ENUM values in PostgreSQL. Down migration is skipped.');
  }
};
