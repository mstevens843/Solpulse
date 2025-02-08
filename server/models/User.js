const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        'User',
        {
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true,
                    len: [3, 30],
                },
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true,
                    isEmail: true,
                },
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [8, 128],
                },
            },
            walletAddress: {
                type: DataTypes.STRING,
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
            bio: {
                type: DataTypes.TEXT,
                allowNull: true,
                validate: {
                    len: [0, 500],
                },
            },
            profilePicture: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    notEmpty: true,  
                }
            }
        },
        {
            tableName: 'Users', // Ensure explicit table name
            timestamps: true,
            paranoid: true, 
            defaultScope: {
                attributes: { exclude: ['password'] },
            },
            scopes: {
                withPassword: {
                    attributes: {},
                },
            },
        }
    );

    // Add hooks for password hashing
    User.addHook('beforeCreate', async (user) => {
        if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
        }
    });

    User.addHook('beforeUpdate', async (user) => {
        if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
        }
    });

    // Restore all associations
    User.associate = (models) => {
        User.hasMany(models.Post, {
            foreignKey: 'userId',
            as: 'posts',
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
            as: 'notifications',
            onDelete: 'CASCADE',
        });
        User.hasMany(models.Transaction, {
            foreignKey: 'userId',
            as: 'transactions',
            onDelete: 'CASCADE',
        });
        User.hasMany(models.Wallet, {
            foreignKey: 'userId',
            as: 'wallets',
            onDelete: 'CASCADE',
        });

        // Many-to-many relationship for likes
        User.belongsToMany(models.Post, {
            through: models.Like,
            as: 'likedPosts',
            foreignKey: 'userId',
            otherKey: 'postId',
            onDelete: 'CASCADE',
            hooks: true, // Ensure cascading deletion works
        });

        // Many-to-many relationship for retweets
        User.belongsToMany(models.Post, {
            through: models.Retweet,
            as: 'retweetedPosts',
            foreignKey: 'userId',
            otherKey: 'postId',
            onDelete: 'CASCADE',
            hooks: true, // Ensure cascading deletion works
        });
    };

    return User;
};