'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add the column without NOT NULL constraint
    await queryInterface.addColumn('Transactions', 'walletId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Wallets',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Populate walletId for existing rows based on walletAddress
    await queryInterface.sequelize.query(`
      UPDATE "Transactions"
      SET "walletId" = w.id
      FROM "Wallets" w
      WHERE "Transactions"."walletAddress" = w."address";
    `);

    // Alter the column to add NOT NULL constraint
    await queryInterface.changeColumn('Transactions', 'walletId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Wallets',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Transactions', 'walletId');
  },
};
