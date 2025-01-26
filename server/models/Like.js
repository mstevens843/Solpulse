module.exports = (sequelize, DataTypes) => {
    const Like = sequelize.define('Like', {
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
      tableName: 'Likes'
    });
  
    Like.associate = function (models) {
      Like.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Like.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' });
    };
  
    return Like;
  };