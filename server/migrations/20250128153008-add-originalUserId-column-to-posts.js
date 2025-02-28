module.exports = {
    async up(queryInterface, Sequelize) {
      await queryInterface.addColumn("Posts", "originalUserId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    },
  
    async down(queryInterface, Sequelize) {
      await queryInterface.removeColumn("Posts", "originalUserId");
    },
  };
  