'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add 'mention' to the enum_Notifications_type enum
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Notifications_type" ADD VALUE 'mention';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // NOTE: PostgreSQL does not support removing values from an enum
    // You would need to recreate the enum type without 'mention' if needed.
    console.warn('Enum values cannot be removed in PostgreSQL. Down migration skipped.');
  }
};
