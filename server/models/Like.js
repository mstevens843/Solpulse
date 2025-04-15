// models/Like.js

module.exports = (sequelize, DataTypes) => {
    const Like = sequelize.define(
      'Like',
      {
        postId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Posts',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Users',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
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
        tableName: 'Likes',
        indexes: [
          { fields: ['userId'] },
          { fields: ['postId'] },
          { fields: ['createdAt'] }, // Optimize time-based queries
        ],
        uniqueKeys: {
          unique_like: {
            fields: ['userId', 'postId'], // Prevent duplicate likes
          },
        },
      }
    );
  
    // **Associations**
    Like.associate = function (models) {
      Like.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user', // Who liked the post
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
  
      Like.belongsTo(models.Post, {
        foreignKey: 'postId',
        as: 'likedPost', // The post that was liked
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
  
      Like.belongsTo(models.Notification, {
        foreignKey: 'notificationId',
        as: 'notification', //  Notification associated with this like
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    };
  
    // **Hooks for Data Integrity**
    Like.beforeCreate(async (like, options) => {
      const existingLike = await Like.findOne({
        where: { userId: like.userId, postId: like.postId },
        transaction: options.transaction, // Ensures atomic operation
      });
  
      if (existingLike) {
        throw new Error('User has already liked this post.');
      }
    });
  
    // **Instance Methods**
    Like.prototype.toggleLike = async function () {
      await this.destroy();
      return 'Like removed';
    };
  
    return Like;
  };
  



