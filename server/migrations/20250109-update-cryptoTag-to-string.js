module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.changeColumn('Posts', 'cryptoTag', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    },
    down: async (queryInterface, Sequelize) => {
      await queryInterface.changeColumn('Posts', 'cryptoTag', {
        type: Sequelize.ENUM('bitcoin', 'ethereum', 'solana', 'dogecoin'),
        allowNull: true,
      });
    },
  };
  