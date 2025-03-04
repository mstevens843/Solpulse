module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define(
        'Notification',
        {
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false, // User who receives the notification
            },
            actorId: {
                type: DataTypes.INTEGER, // ID of the actor who performed the action
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
            },
            type: {
                type: DataTypes.ENUM('like', 'comment', 'follow', 'retweet', 'transaction'), // Type of notification
                allowNull: false,
            },
            message: {
                type: DataTypes.STRING, // Message for the notification
                allowNull: true, // Optional: Generated automatically if not provided
            },
            amount: {
                type: DataTypes.FLOAT, // Used for transaction notifications (e.g., amount of SOL sent)
                allowNull: true,
            },
            entityId: {
                type: DataTypes.STRING, // Updated to STRING to store transaction signature (for tips)
                allowNull: true,
            },
            entityType: {
                type: DataTypes.STRING, // Optional: Type of the related entity (e.g., 'Post', 'Comment')
                allowNull: true,
            },
            isRead: {
                type: DataTypes.BOOLEAN,
                defaultValue: false, // Defaults to false (unread)
            },
        },
        {
            timestamps: true, // Automatically add createdAt and updatedAt fields
            paranoid: true, // Enable soft deletion with `deletedAt`
        }
    );

    Notification.associate = function (models) {
        Notification.belongsTo(models.User, { foreignKey: 'userId' }); // Notification belongs to a user
        Notification.belongsTo(models.User, { foreignKey: 'actorId', as: 'actor' }); // Actor reference
    };

    Notification.beforeCreate((notification) => {
        if (!notification.message) {
            const typeMessages = {
                like: 'Your post was liked.',
                comment: 'Your post received a comment.',
                follow: 'You have a new follower.',
                retweet: 'Your post was reposted.',
                transaction: `You received ${notification.amount} SOL.`, // Correctly formats tip notifications
            };
            notification.message = typeMessages[notification.type] || 'You have a new notification.';
        }
    });

    return Notification;
};
