module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define(
      'Post',
      {
          userId: {
              type: DataTypes.INTEGER,
              allowNull: false,
              references: { model: 'Users', key: 'id' },
          },
          content: {
              type: DataTypes.STRING(280),
              allowNull: false,
              validate: {
                  len: { args: [1, 280], msg: 'Content must be between 1 and 280 characters.' },
              },
          },
          mediaUrl: {
              type: DataTypes.STRING,
              allowNull: true,
              validate: {
                  isUrl: { msg: 'Media URL must be a valid URL.' },
                  isValidFileType(value) {
                      if (value && !/\.(jpg|jpeg|png|gif|mp4|mp3|wav)$/i.test(value)) {
                          throw new Error('Invalid file type. Allowed: jpg, png, gif, mp4, mp3, wav.');
                      }
                  },
              },
          },
          mediaType: {
              type: DataTypes.STRING, // ✅ Replace ENUM with STRING + Validation
              allowNull: false,
              defaultValue: 'none',
              validate: {
                  isIn: {
                      args: [['image', 'video', 'audio', 'none']],
                      msg: 'Invalid media type. Allowed: image, video, audio, none.',
                  },
              },
          },
          cryptoTag: {
              type: DataTypes.STRING(50),
              allowNull: true,
              validate: {
                  is: {
                      args: /^[a-zA-Z0-9]+$/,
                      msg: 'cryptoTag must only contain letters and numbers.',
                  },
              },
          },
          likes: {
              type: DataTypes.INTEGER,
              allowNull: false,
              defaultValue: 0,
          },
          retweets: {
              type: DataTypes.INTEGER,
              allowNull: false,
              defaultValue: 0,
          },
          isRetweet: {
              type: DataTypes.BOOLEAN,
              allowNull: false,
              defaultValue: false,
          },
          originalPostId: {
              type: DataTypes.INTEGER,
              allowNull: true,
              references: { model: 'Posts', key: 'id' },
              onDelete: 'SET NULL',
          },
          originalUserId: {
              type: DataTypes.INTEGER,
              allowNull: true,
              references: { model: 'Users', key: 'id' },
              onDelete: 'SET NULL',
          },
          originalAuthor: {
              type: DataTypes.STRING,
              allowNull: true,
          },
          originalProfilePicture: {
              type: DataTypes.STRING,
              allowNull: true,
          },
          deletedAt: {
              type: DataTypes.DATE,
              allowNull: true,
          },
      },
      {
          tableName: 'Posts',
          timestamps: true,
          paranoid: true, // Enables soft deletes
          indexes: [
              { fields: ['userId'] }, 
              { fields: ['cryptoTag'] }, // ✅ Optimize searches by topic
              { fields: ['likes'] }, // ✅ Optimize trending
              { fields: ['retweets'] }, // ✅ Optimize viral posts
          ],
      }
  );

  // **Associations**
  Post.associate = function (models) {
      Post.belongsTo(models.User, {
          foreignKey: 'userId',
          as: 'user',
          onDelete: 'CASCADE',
          hooks: true,
      });

      Post.hasMany(models.Comment, {
          foreignKey: 'postId',
          as: 'comments',
          onDelete: 'CASCADE',
          hooks: true,
      });

      // **Many-to-Many Relationships**
      Post.belongsToMany(models.User, {
          through: models.Like,
          as: 'likedByUsers',
          foreignKey: 'postId',
          otherKey: 'userId',
          onDelete: 'CASCADE',
      });

      Post.belongsToMany(models.User, {
          through: models.Retweet,
          as: 'retweetedByUsers',
          foreignKey: 'postId',
          otherKey: 'userId',
          onDelete: 'CASCADE',
      });

      // **Retweet Relationship**
      Post.belongsTo(models.Post, {
          foreignKey: 'originalPostId',
          as: 'originalPost',
          onDelete: 'SET NULL',
      });
  };

  // ✅ **Hooks for Preprocessing & Validation**
  Post.beforeSave((post) => {
      // **Auto-Detect Crypto Tags**
      if (!post.cryptoTag && post.content) {
          const tags = ['bitcoin', 'ethereum', 'solana', 'dogecoin'];
          for (const tag of tags) {
              if (post.content.toLowerCase().includes(tag)) {
                  post.cryptoTag = tag;
                  break;
              }
          }
      }

      // **Extract Hashtags & Mentions**
      const hashtagRegex = /#(\w+)/g;
      const mentionRegex = /@(\w+)/g;
      post.hashtags = (post.content.match(hashtagRegex) || []).map((h) => h.replace('#', ''));
      post.mentions = (post.content.match(mentionRegex) || []).map((m) => m.replace('@', ''));
  });

  // ✅ **Instance Methods for Post Actions**
  Post.prototype.incrementLikes = async function () {
      this.likes += 1;
      await this.save();
      return this.likes;
  };

  Post.prototype.incrementRetweets = async function () {
      this.retweets += 1;
      await this.save();
      return this.retweets;
  };

  //  ✅ **Helper Function: Format Post for API Response**
  Post.prototype.getFormattedPost = function () {
      return {
          id: this.id,
          userId: this.userId,
          content: this.content,
          mediaUrl: this.mediaUrl,
          mediaType: this.mediaType,
          cryptoTag: this.cryptoTag,
          likes: this.likes,
          retweets: this.retweets,
          isRetweet: this.isRetweet,
          originalPostId: this.originalPostId,
          originalUserId: this.originalUserId,
          originalAuthor: this.originalAuthor,
          originalProfilePicture: this.originalProfilePicture,
          createdAt: this.createdAt,
      };
  };

  return Post;
};



/**
 * ✅ Key Improvements & Fixes
1️⃣ Performance Enhancements
✅ Indexes on cryptoTag, likes, and retweets for faster lookups.
✅ Reduce ENUM Use: Replace ENUM for mediaType with STRING + validate for easier migrations.
✅ Optimize Hooks: Merge duplicate beforeCreate hooks for efficiency.
2️⃣ Security Fixes
✅ Improve Validation for mediaUrl: Allow only image/video/audio formats.
✅ Prevent cryptoTag from Having Special Characters: Enforce a stricter regex.
3️⃣ Maintainability & Readability
✅ Use beforeSave Instead of Multiple beforeCreate Hooks.
✅ Improve Hashtag & Mention Extraction: Ensure proper format handling.
✅ Add getFormattedPost Helper Method: Simplifies API responses.
 */