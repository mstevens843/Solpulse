module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define(
    'Post',
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Ensure correct table reference
          key: 'id',
        },
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [1, 280], // Enforce character limit for better UX
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
      deletedAt: {
        type: DataTypes.DATE, // Enable soft deletes
        allowNull: true,
      },
    },
    {
      tableName: 'Posts', // Explicitly match the table name in DB
      timestamps: true,
      paranoid: true, // Enable soft deletes
      indexes: [
        {
          fields: ['userId'], // Index for performance on user-based queries
        },
        {
          fields: ['cryptoTag'], // Index for tag-based searches
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


// Indexes:
// Add indexes for frequently queried columns like userId and cryptoTag to optimize query performance.


// Media Type Validation:
// Add a mediaType column to store the type of media (e.g., image, video, audio) and validate mediaUrl accordingly.

// Hashtags and Mentions:
// Extract hashtags and mentions from content to facilitate features like tag-based searches or user mentions.
// Use Sequelize hooks (beforeCreate, beforeUpdate) to process hashtags and mentions automatically

// Soft Deletes:

// Add a deletedAt field with Sequelize's paranoid option to enable soft deletion of posts.

// Character Limit for Content:

// Enforce a character limit on content for better UX (e.g., 280 characters like Twitter).
// CryptoTag Validation:

// Add a list of valid cryptoTag options and validate against it.
// Hooks:

// Use Sequelize hooks to validate or process fields. For example:
// Process URLs for mediaUrl.
// Automatically populate cryptoTag if a post contains certain keywords.

// Benefits of the Updates:
// Scalability: Indexing and soft deletes improve performance and data management.
// Validation: Prevents invalid data (e.g., invalid media URLs or crypto tags).
// Automation: Hooks reduce manual effort for common tasks like populating cryptoTag.
// Better UX: Limits content length and adds meaningful error messages.