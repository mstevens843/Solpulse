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
                type: DataTypes.ENUM('like', 'comment', 'follow', 'transaction'), // Type of notification
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
                type: DataTypes.INTEGER, // Optional: ID of the related entity
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
                transaction: `You received ${notification.amount} SOL.`,
            };
            notification.message = typeMessages[notification.type] || 'You have a new notification.';
        }
    });

    return Notification;
};



// Foreign Key for Actor:
// Instead of storing the actor as a STRING, use a foreign key (actorId) referencing the User model. 
// This ensures referential integrity and makes it easier to fetch the actor's details if needed.

// Indexing:

// Add an index on userId and isRead to optimize queries like fetching unread notifications for a specific user.

// Optional Linking to Related Entities:

// For notifications tied to specific entities (e.g., posts, comments, transactions), add an optional entityId and entityType to generalize the association:

// Default message Generation:

// Use Sequelize hooks (beforeCreate) to automatically populate the message field based on the type of notification, actor, and action.

// Soft Deletes:

// Add a deletedAt field with Sequelize's paranoid option to allow soft deletion of notifications.

// Benefits of These Changes
// Data Integrity: Using actorId instead of actor ensures a direct relationship with the User model.
// Scalability: Adding entityId and entityType supports notifications tied to different models.
// Efficiency: Indexing improves query performance.
// Soft Deletes: Allows recovering deleted notifications if needed.
