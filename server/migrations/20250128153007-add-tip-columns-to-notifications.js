module.exports = {
    async up(queryInterface, Sequelize) {
      // await queryInterface.addColumn('Notifications', 'amount', {
      //   type: Sequelize.FLOAT,
      //   allowNull: true,
      // });
  
      // await queryInterface.addColumn('Notifications', 'entityId', {
      //   type: Sequelize.STRING,
      //   allowNull: true,
      // });
    },
  
    async down(queryInterface, Sequelize) {
      // await queryInterface.removeColumn('Notifications', 'amount');
      // await queryInterface.removeColumn('Notifications', 'entityId');
    }
  };