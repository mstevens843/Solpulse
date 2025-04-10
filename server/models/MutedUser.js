module.exports = (sequelize, DataTypes) => {
    const MutedUser = sequelize.define('MutedUser', {
      muterId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      mutedId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
      tableName: 'MutedUsers',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['muterId', 'mutedId']
        }
      ]
    });
  
    MutedUser.associate = (models) => {
      MutedUser.belongsTo(models.User, { as: 'muter', foreignKey: 'muterId' });
      MutedUser.belongsTo(models.User, { as: 'muted', foreignKey: 'mutedId' });
    };
  
    return MutedUser;
  };
  