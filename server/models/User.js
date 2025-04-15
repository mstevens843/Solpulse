const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        'User',
        {
            username: {
                type: DataTypes.STRING(30),
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true,
                    len: [3, 30],
                },
            },
            email: {
                type: DataTypes.STRING(100), // Explicit max length
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true,
                    isEmail: true,
                },
            },
            password: {
                type: DataTypes.STRING(128), //  Store hashed password (not plaintext)
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [8, 128],
                },
            },
            walletAddress: {
                type: DataTypes.STRING(44), // Solana wallet addresses are between 32-44 characters
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true,
                    is: {
                        args: /^[A-HJ-NP-Za-km-z1-9]{32,44}$/i,
                        msg: 'Invalid wallet address format',
                    },
                },
            },
            // Added settings-related defaults
            privacy: {
                type: DataTypes.ENUM("public", "private"),
                allowNull: false,
                defaultValue: "public",
            },
            notifications: {
                type: DataTypes.ENUM("enabled", "disabled"),
                allowNull: false,
                defaultValue: "enabled",
            },
            theme: {
                type: DataTypes.ENUM("dark", "light"),
                allowNull: false,
                defaultValue: "dark",
            },
            bio: {
                type: DataTypes.TEXT,
                allowNull: true,
                validate: {
                    len: [0, 500],
                },
            },
            profilePicture: {
                type: DataTypes.STRING,
                allowNull: true, // Allow null instead of enforcing `notEmpty`
            },
        },
        {
            tableName: 'Users',
            timestamps: true,
            paranoid: true, // Enables soft deletes
            charset: 'utf8mb4', // Allows Unicode characters (emojis, special characters)
            collate: 'utf8mb4_unicode_ci',
            indexes: [
                { unique: true, fields: ['username'] }, // Fast lookups
                { unique: true, fields: ['email'] }, // Fast lookups
                { unique: true, fields: ['walletAddress'] }, // Fast lookups
            ],
            defaultScope: {
                attributes: { exclude: ['password'] }, // Always exclude password unless explicitly requested
            },
            scopes: {
                withPassword: {
                    attributes: { include: ['password'] }, // Explicitly include password
                },
            },
        }
    );


    //  Rehash password only if it's changed
    User.addHook('beforeSave', async (user) => {
        if (user.changed('password')) {
            user.password = await bcrypt.hash(user.password, 10);
        }
    });

    User.associate = (models) => {
        User.hasMany(models.Post, {
            foreignKey: 'userId',
            // as: 'posts',
            as: 'user',
            onDelete: 'CASCADE',
            hooks: true,
        });
        User.hasMany(models.Comment, {
            foreignKey: 'userId',
            as: 'comments',
            onDelete: 'CASCADE',
        });
        User.hasMany(models.Follower, {
            foreignKey: 'followerId',
            as: 'following',
            onDelete: 'CASCADE',
        });
        User.hasMany(models.Follower, {
            foreignKey: 'followingId',
            as: 'followers',
            onDelete: 'CASCADE',
        });
        User.hasMany(models.Notification, {
            foreignKey: 'userId',
            as: 'userNotifications', //  renamed to avoid conflict
            onDelete: 'CASCADE',
          });
        User.hasMany(models.Transaction, {
            foreignKey: 'userId',
            as: 'transactions',
            onDelete: 'SET NULL', //  Important: don't lose financial records
        });
        User.hasMany(models.Wallet, {
            foreignKey: 'userId',
            as: 'wallets',
            onDelete: 'CASCADE',
        });

        User.belongsToMany(models.Post, {
            through: models.Like,
            as: 'likedPosts',
            foreignKey: 'userId',
            otherKey: 'postId',
            onDelete: 'CASCADE',
            hooks: true,
        });
        User.hasMany(models.FollowRequest, {
            as: 'sentFollowRequests',
            foreignKey: 'requesterId',
            onDelete: 'CASCADE',
          });
          
          User.hasMany(models.FollowRequest, {
            as: 'receivedFollowRequests',
            foreignKey: 'targetId',
            onDelete: 'CASCADE',
          });
          User.hasMany(models.MessageRequest, {
            as: 'sentMessageRequests',
            foreignKey: 'senderId',
            onDelete: 'CASCADE',
          });
          
          User.hasMany(models.MessageRequest, {
            as: 'receivedMessageRequests',
            foreignKey: 'recipientId',
            onDelete: 'CASCADE',
          });

        // Many-to-many relationship for retweets
        User.belongsToMany(models.Post, {
            through: models.Retweet,
            as: 'retweetedPosts',
            foreignKey: 'userId',
            otherKey: 'postId',
            onDelete: 'CASCADE',
            hooks: true,
        });
        // Users this user has blocked
        User.belongsToMany(models.User, {
            through: models.BlockedUser,
            as: 'blockedUsers',
            foreignKey: 'blockerId',
            otherKey: 'blockedId',
            onDelete: 'CASCADE',
          });
          // Users who have blocked this user
            User.belongsToMany(models.User, {
                through: models.BlockedUser,
                as: 'blockedByUsers',
                foreignKey: 'blockedId',
                otherKey: 'blockerId',
                onDelete: 'CASCADE',
            });
            // Users this user has muted
            User.belongsToMany(models.User, {
                through: models.MutedUser,
                as: 'mutedUsers',
                foreignKey: 'muterId',
                otherKey: 'mutedId',
                onDelete: 'CASCADE',
            });
            
            // Users who muted this user
            User.belongsToMany(models.User, {
                through: models.MutedUser,
                as: 'mutedByUsers',
                foreignKey: 'mutedId',
                otherKey: 'muterId',
                onDelete: 'CASCADE',
            });
    };

    return User;
};

