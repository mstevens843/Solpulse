module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define(
    'Post',
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [1, 280],
            msg: 'Content must be between 1 and 280 characters.',
          },
        },
      },
      mediaUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: {
            msg: 'Media URL must be a valid URL.',
          },
        },
      },
      mediaType: {
        type: DataTypes.ENUM('image', 'video', 'audio', 'none'),
        allowNull: true,
        defaultValue: 'none',
        validate: {
          isIn: {
            args: [['image', 'video', 'audio', 'none']],
            msg: 'Invalid media type. Allowed values: image, video, audio, none.',
          },
        },
      },
      cryptoTag: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isAlphanumeric: {
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
        references: {
          model: 'Posts',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      originalUserId: {  // ✅ Add this
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
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
      paranoid: true,
      indexes: [
        {
          fields: ['userId'],
        },
        {
          fields: ['cryptoTag'],
        },
      ],
    }
  );

  // Associations
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

    // Many-to-many relationship for likes
    Post.belongsToMany(models.User, {
      through: models.Like,
      as: 'likedByUsers',
      foreignKey: 'postId',
      otherKey: 'userId',
      onDelete: 'CASCADE',
    });

    // Many-to-many relationship for retweets
    Post.belongsToMany(models.User, {
      through: models.Retweet,
      as: 'retweetedByUsers',
      foreignKey: 'postId',
      otherKey: 'userId',
      onDelete: 'CASCADE',
    });

  // **Retweet Relationship**
  Post.belongsTo(models.Post, {
    foreignKey: "originalPostId",
    as: "originalPost",
    onDelete: "SET NULL",
  });
};

  // Hooks for preprocessing and validation
  Post.beforeCreate((post) => {
    if (!post.cryptoTag && post.content) {
      const tags = ['bitcoin', 'ethereum', 'solana', 'dogecoin'];
      for (const tag of tags) {
        if (post.content.toLowerCase().includes(tag)) {
          post.cryptoTag = tag;
          break;
        }
      }
    }
  });

  // Hook to extract hashtags and mentions
  Post.beforeCreate((post) => {
    const hashtagRegex = /#\w+/g;
    const mentionRegex = /@\w+/g;
    post.hashtags = post.content.match(hashtagRegex) || [];
    post.mentions = post.content.match(mentionRegex) || [];
  });

  // Custom instance methods for post actions
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

  return Post;
};