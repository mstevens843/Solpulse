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
            fields: ['userId', 'postId'], // ✅ Prevent duplicate retweets
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
  


/**
 * Improvements & Optimizations:
Ensure Unique Retweets:

A user should not be able to retweet the same post multiple times. Add a unique constraint on userId and postId to prevent duplicate retweets.
Cascade Deletes:

If a post is deleted, all associated retweets should also be deleted.
If a user is deleted, their retweets should also be removed.
Add Indexing for Performance:

Since users will frequently query retweets, add indexes on userId and postId to improve query performance.
Define defaultScope for Optimized Queries:

By default, exclude unnecessary attributes in queries.
 */