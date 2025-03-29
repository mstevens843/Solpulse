'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "privacy", {
      type: Sequelize.ENUM("public", "private"),
      allowNull: false,
      defaultValue: "public",
    });

    await queryInterface.addColumn("Users", "notifications", {
      type: Sequelize.ENUM("enabled", "disabled"),
      allowNull: false,
      defaultValue: "enabled",
    });

    await queryInterface.addColumn("Users", "theme", {
      type: Sequelize.ENUM("dark", "light"),
      allowNull: false,
      defaultValue: "dark",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "privacy");
    await queryInterface.removeColumn("Users", "notifications");
    await queryInterface.removeColumn("Users", "theme");

    // ✅ Drop ENUMs manually to avoid Sequelize ENUM leftovers in Postgres
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_privacy";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_notifications";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_theme";');
  },
};
