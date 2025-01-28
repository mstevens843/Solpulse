'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Posts', 'isRetweet', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('Posts', 'originalPostId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Posts',
        key: 'id',
      },
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Posts', 'isRetweet');
    await queryInterface.removeColumn('Posts', 'originalPostId');
  }
};
