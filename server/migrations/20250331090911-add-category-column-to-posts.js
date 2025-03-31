'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Posts", "category", {
      type: Sequelize.ENUM("Meme", "NFT", "Crypto", "DAO", "On-chain Drama", "General"),
      allowNull: false,
      defaultValue: "General",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Posts", "category");

    // ✅ Drop ENUM manually to avoid leftover enum types in Postgres
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Posts_category";');
  },
};
