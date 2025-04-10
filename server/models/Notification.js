// models/Notification.js

module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define(
      'Notification',
      {
        userId: {
          type: DataTypes.INTEGER, // Receiver
          allowNull: false,
          references: { model: 'Users', key: 'id' },
          onDelete: 'CASCADE',
        },
        actorId: {
          type: DataTypes.INTEGER, // Who triggered the notification
          allowNull: false,
          references: { model: 'Users', key: 'id' },
          onDelete: 'CASCADE',
        },
        type: {
          type: DataTypes.ENUM('like', 'comment', 'follow', 'retweet', 'transaction', 'message-request', 'follow-request'),
          allowNull: false,
        },
        message: {
          type: DataTypes.STRING,
          allowNull: true, // Optional: can be auto-generated
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        amount: {
          type: DataTypes.FLOAT,
          allowNull: true, // Used for tips
        },
        entityId: {
          type: DataTypes.STRING,
          allowNull: true, // E.g. postId, transaction ID, etc.
        },
        entityType: {
          type: DataTypes.STRING,
          allowNull: true, // 'Post', 'Comment', etc.
        },
        isRead: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
      },
      {
        timestamps: true,
        paranoid: true,
        indexes: [
          { fields: ['userId'] },
          { fields: ['isRead'] },
          { fields: ['type'] },
        ],
        defaultScope: {
          order: [['createdAt', 'DESC']],
        },
      }
    );
  
    Notification.associate = function (models) {
      Notification.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'receiver',
        onDelete: 'CASCADE',
      });
  
      Notification.belongsTo(models.User, {
        foreignKey: 'actorId',
        as: 'actor',
        onDelete: 'CASCADE',
      });
  
      // ✅ These allow reverse lookups (optional but recommended)
      Notification.hasOne(models.Like, {
        foreignKey: 'notificationId',
        as: 'like',
        onDelete: 'SET NULL',
      });
  
      Notification.hasOne(models.Retweet, {
        foreignKey: 'notificationId',
        as: 'retweet',
        onDelete: 'SET NULL',
      });
      Notification.hasOne(models.MessageRequest, {
        foreignKey: 'notificationId',
        as: 'messageRequest',
        onDelete: 'SET NULL',
      });
      
      Notification.hasOne(models.FollowRequest, {
        foreignKey: 'notificationId',
        as: 'followRequest',
        onDelete: 'SET NULL',
      });
    };
  
    Notification.beforeCreate((notification) => {
      if (!notification.message) {
        const typeMessages = {
          like: 'Your post was liked.',
          comment: 'Your post received a comment.',
          follow: 'You have a new follower.',
          retweet: 'Your post was reposted.',
          transaction: `You received ${parseFloat(notification.amount).toFixed(2)} SOL.`,
          'message-request': 'You received a new message request.',
          'follow-request': 'You received a follow request.',
        };
        notification.message = typeMessages[notification.type] || 'You have a new notification.';
      }
  
      if (notification.userId === notification.actorId) {
        throw new Error('User cannot notify themselves.');
      }
    });
  
    return Notification;
  };
  

/**
 * Potential Improvements and Optimizations for Notification Model
Ensure Actor and Receiver are Different

A user shouldn't receive a notification for their own actions (e.g., liking their own post).
Add a constraint to prevent userId === actorId.
Optimize Indexing for Query Performance

Add indexes for userId and isRead to speed up notification queries.
Index type for filtering different notification types efficiently.
Cascade Deletion for Data Integrity

If a user is deleted, their notifications should be deleted to prevent orphaned records.
Default Sorting for Notifications

Set a default order to return the most recent notifications first.
Message Formatting for Transactions

Ensure the transaction amount is formatted to two decimal places.
 */