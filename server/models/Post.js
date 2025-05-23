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
          type: DataTypes.STRING,
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
        category: {
          type: DataTypes.ENUM("Meme", "NFT", "Crypto", "DAO", "On-chain Drama", "General"),
          allowNull: false,
          defaultValue: "General",
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
          { fields: ['cryptoTag'] },
          { fields: ['likes'] },
          { fields: ['retweets'] },
        ],
      }
    );
  
    // **Associations**
    Post.associate = function (models) {
      // SINGLE belongsTo for user
      Post.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE',
        hooks: true,
      });


      // Has Many Comments
      Post.hasMany(models.Comment, {
        foreignKey: 'postId',
        as: 'comments',
        onDelete: 'CASCADE',
        hooks: true,
      });
  
      // **Many-to-Many: Liked Users**
      Post.belongsToMany(models.User, {
        through: models.Like,
        as: 'likedByUsers',
        foreignKey: 'postId',
        otherKey: 'userId',
        onDelete: 'CASCADE',
      });
  
      // **Many-to-Many: Retweeted Users**
      Post.belongsToMany(models.User, {
        through: models.Retweet,
        as: 'retweetedByUsers',
        foreignKey: 'postId',
        otherKey: 'userId',
        onDelete: 'CASCADE',
      });
  
      // **Retweet Relationship** (Post can belong to an original Post)
      Post.belongsTo(models.Post, {
        foreignKey: 'originalPostId',
        as: 'originalPost',
        onDelete: 'SET NULL',
      });
    };
  
    //  Hooks, methods, etc.
    Post.beforeSave((post) => {
      // Auto-Detect Crypto Tags
      if (!post.cryptoTag && post.content) {
        const tags = ['bitcoin', 'ethereum', 'solana', 'dogecoin'];
        for (const tag of tags) {
          if (post.content.toLowerCase().includes(tag)) {
            post.cryptoTag = tag;
            break;
          }
        }
      }
  
      // Extract Hashtags & Mentions
      const hashtagRegex = /#(\w+)/g;
      const mentionRegex = /@(\w+)/g;
      post.hashtags = (post.content.match(hashtagRegex) || []).map((h) => h.replace('#', ''));
      post.mentions = (post.content.match(mentionRegex) || []).map((m) => m.replace('@', ''));
    });
  
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

