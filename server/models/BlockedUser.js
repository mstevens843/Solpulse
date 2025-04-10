module.exports = (sequelize, DataTypes) => {
    const BlockedUser = sequelize.define('BlockedUser', {
      blockerId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      blockedId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
      tableName: 'BlockedUsers',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['blockerId', 'blockedId']
        }
      ]
    });
  
    BlockedUser.associate = (models) => {
      BlockedUser.belongsTo(models.User, { as: 'blocker', foreignKey: 'blockerId' });
      BlockedUser.belongsTo(models.User, { as: 'blocked', foreignKey: 'blockedId' });
    };
  
    return BlockedUser;
  };
  