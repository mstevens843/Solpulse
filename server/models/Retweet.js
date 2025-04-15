module.exports = (sequelize, DataTypes) => {
    const Retweet = sequelize.define(
      'Retweet',
      {
        postId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Posts',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        notificationId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'Notifications',
            key: 'id',
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        },
      },
      {
        timestamps: true,
        tableName: 'Retweets',
        indexes: [
          {
            unique: true,
            fields: ['userId', 'postId'], // Prevent duplicate retweets
          },
          {
            fields: ['postId'],
          },
          {
            fields: ['userId'],
          },
        ],
        defaultScope: {
          attributes: { exclude: ['updatedAt'] },
        },
      }
    );
  
    Retweet.associate = function (models) {
      Retweet.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE',
      });
  
      Retweet.belongsTo(models.Post, {
        foreignKey: 'postId',
        as: 'post',
        onDelete: 'CASCADE',
      });
  
      Retweet.belongsTo(models.Notification, {
        foreignKey: 'notificationId',
        as: 'notification',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    };
  
    return Retweet;
  };
  

