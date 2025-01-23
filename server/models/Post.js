module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define(
      'Post',
      {
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Users', // Reference to User model
            key: 'id',
          },
        },
        content: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            len: {
              args: [1, 280], // Content length validation
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
        },
        cryptoTag: {
          type: DataTypes.STRING, // Changed from ENUM to STRING
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
      },
      {
        timestamps: true,
        paranoid: true, // Enable soft deletes
      }
    );
  
    // Associations
    Post.associate = function (models) {
      Post.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE', // Ensure cascade delete
        hooks: true, // Required for CASCADE to work
      });
  
      Post.hasMany(models.Comment, {
        foreignKey: 'postId',
        as: 'comments',
        onDelete: 'CASCADE', // Ensure cascade delete
        hooks: true, // Required for CASCADE to work
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
  
    // Custom instance methods for the Post model
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