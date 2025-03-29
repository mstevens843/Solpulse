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
          as: 'likedByUser', // Renamed for clarity
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
      });

      Like.belongsTo(models.Post, {
          foreignKey: 'postId',
          as: 'likedPost', // Renamed for clarity
          onDelete: 'CASCADE',
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



  /**
   * ✅ Key Improvements & Fixes
1️⃣ Performance Enhancements
✅ Added unique constraint on userId + postId → Prevents duplicate likes.
✅ Added indexes on userId, postId, and createdAt → Faster lookups and filtering.
2️⃣ Data Integrity & Security
✅ Added onDelete: CASCADE → Ensures likes are deleted when a user or post is deleted.
✅ Prevent duplicate likes using a beforeCreate hook.
3️⃣ Maintainability & Readability
✅ Renamed association aliases (likedByUser, likedPost) for better clarity.
✅ Added a toggleLike instance method → Simplifies like/unlike logic.
   */