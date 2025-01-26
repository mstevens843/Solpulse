module.exports = (sequelize, DataTypes) => {
    const Retweet = sequelize.define('Retweet', {
      postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Posts',
          key: 'id',
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
    }, {
      timestamps: true,
      tableName: 'Retweets'
    });
  
    Retweet.associate = function (models) {
      Retweet.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Retweet.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' });
    };
  
    return Retweet;
  };
  