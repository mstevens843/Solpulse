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
                type: DataTypes.STRING(128), // ✅  Store hashed password (not plaintext)
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [8, 128],
                },
            },
            walletAddress: {
                type: DataTypes.STRING(44), // ✅ Solana wallet addresses are between 32-44 characters
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
            // ✅ Added settings-related defaults
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
                allowNull: true, // ✅ Allow null instead of enforcing `notEmpty`
            },
        },
        {
            tableName: 'Users',
            timestamps: true,
            paranoid: true, // ✅ Enables soft deletes
            charset: 'utf8mb4', // ✅ Allows Unicode characters (emojis, special characters)
            collate: 'utf8mb4_unicode_ci',
            indexes: [
                { unique: true, fields: ['username'] }, // ✅ Fast lookups
                { unique: true, fields: ['email'] }, // ✅ Fast lookups
                { unique: true, fields: ['walletAddress'] }, // ✅ Fast lookups
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


    // ✅ Rehash password only if it's changed
    User.addHook('beforeSave', async (user) => {
        if (user.changed('password')) {
            user.password = await bcrypt.hash(user.password, 10);
        }
    });

    // ✅ All associations declared cleanly and logically
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
            as: 'userNotifications', // ✅ renamed to avoid conflict
            onDelete: 'CASCADE',
          });
        User.hasMany(models.Transaction, {
            foreignKey: 'userId',
            as: 'transactions',
            onDelete: 'SET NULL', // ✅ Important: don't lose financial records
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

        // Many-to-many relationship for retweets
        User.belongsToMany(models.Post, {
            through: models.Retweet,
            as: 'retweetedPosts',
            foreignKey: 'userId',
            otherKey: 'postId',
            onDelete: 'CASCADE',
            hooks: true,
        });
    };

    return User;
};


/**
 * ✅ Key Improvements & Fixes
1️⃣ Performance Enhancements
✅ Add Indexes for frequently queried fields (username, email, walletAddress) to speed up lookups.
✅ Optimize Associations by setting onDelete: SET NULL where appropriate to avoid accidental deletion of dependent records.
✅ Use Efficient Password Hashing by checking if the password has changed before re-hashing in beforeUpdate.
2️⃣ Security Fixes
✅ Ensure Unique Wallet Addresses Are Checked in a Case-Insensitive Manner (if relevant for your use case).
✅ Avoid Empty Strings in profilePicture: Instead of notEmpty, allow null values for better validation.
3️⃣ Maintainability & Readability
✅ Use beforeSave Instead of Separate Hooks for beforeCreate and beforeUpdate.
✅ Improve Default Scopes: withPassword should explicitly include password instead of an empty attribute list.
✅ Set charset: 'utf8mb4' in model options for compatibility with emojis in bio and username.
 */