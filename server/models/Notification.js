module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define(
        'Notification',
        {
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false, // ✅ User who receives the notification
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            actorId: {
                type: DataTypes.INTEGER, // ✅ ID of the actor who performed the action
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
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
                type: DataTypes.FLOAT, // ✅ Used for transaction notifications (e.g., amount of SOL sent)
                allowNull: true,
            },
            entityId: {
                type: DataTypes.STRING, // ✅ Can store transaction signature (for tips) or related entity ID
                allowNull: true,
            },
            entityType: {
                type: DataTypes.STRING, // ✅ Type of the related entity (e.g., 'Post', 'Comment')
                allowNull: true,
            },
            isRead: {
                type: DataTypes.BOOLEAN,
                defaultValue: false, // ✅ Defaults to false (unread)
            },
        },
        {
            timestamps: true, // Automatically add createdAt and updatedAt fields
            paranoid: true, // Enable soft deletion with `deletedAt`
            indexes: [
                { fields: ['userId'] }, // ✅ Lookup by receiver
                { fields: ['isRead'] }, // ✅ Efficient unread queries
                { fields: ['type'] }, // ✅ filter by notification type
            ],
            defaultScope: {
                order: [['createdAt', 'DESC']], // Sort newest first
            },
        }
    );

    Notification.associate = function (models) {
        Notification.belongsTo(models.User, { foreignKey: 'userId', as: 'receiver', onDelete: 'CASCADE' }); // Receiver
        Notification.belongsTo(models.User, { foreignKey: 'actorId', as: 'actor', onDelete: 'CASCADE' }); // Actor reference
    };

    // ✅ Auto-generate messages + prevent self-notifications
    Notification.beforeCreate((notification) => {
        if (!notification.message) {
            const typeMessages = {
                like: 'Your post was liked.',
                comment: 'Your post received a comment.',
                follow: 'You have a new follower.',
                retweet: 'Your post was reposted.',
                transaction: `You received ${parseFloat(notification.amount).toFixed(2)} SOL.`,
            };
            notification.message = typeMessages[notification.type] || 'You have a new notification.';
        }

        // Prevent users from generating notifications for their own actions
        if (notification.userId === notification.actorId) {
            throw new Error('User cannot notify themselves.');
        }
    });

    return Notification;
};




/**
 * Potential Improvements and Optimizations for Notification Model
Ensure Actor and Receiver are Different

A user shouldn't receive a notification for their own actions (e.g., liking their own post).
Add a constraint to prevent userId === actorId.
Optimize Indexing for Query Performance

Add indexes for userId and isRead to speed up notification queries.
Index type for filtering different notification types efficiently.
Cascade Deletion for Data Integrity

If a user is deleted, their notifications should be deleted to prevent orphaned records.
Default Sorting for Notifications

Set a default order to return the most recent notifications first.
Message Formatting for Transactions

Ensure the transaction amount is formatted to two decimal places.
 */