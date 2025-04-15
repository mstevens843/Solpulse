module.exports = (sequelize, DataTypes) => {
    const Follower = sequelize.define(
        'Follower',
        {
            followerId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            followingId: {
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
            paranoid: false, // No soft delete (Followers shouldn't be recoverable)
            tableName: 'Followers',
            indexes: [
                {
                    unique: true,
                    fields: ['followerId', 'followingId'],
                },
                {
                    fields: ['followingId', 'createdAt'], // Optimized for follower notifications
                },
            ],
        }
    );

    // **Associations**
    Follower.associate = (models) => {
        Follower.belongsTo(models.User, {
            as: 'followerUser', // Renamed for clarity
            foreignKey: 'followerId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });

        Follower.belongsTo(models.User, {
            as: 'followedUser', // Renamed for clarity
            foreignKey: 'followingId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });

        Follower.belongsTo(models.Notification, {
            foreignKey: 'notificationId',
            as: 'notification',
        });
    };

    // **Hooks for Data Integrity**
    Follower.beforeCreate(async (follower) => {
        if (follower.followerId === follower.followingId) {
            throw new Error('A user cannot follow themselves.');
        }
    });

    // **Instance Methods for Follow Actions**
    Follower.prototype.getFollowDetails = function () {
        return {
            followerId: this.followerId,
            followingId: this.followingId,
            createdAt: this.createdAt,
        };
    };

    return Follower;
};

