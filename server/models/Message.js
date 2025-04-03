module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define(
        'Message',
        {
            senderId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            recipientId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            content: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [1, 500],
                        msg: 'Message content must be between 1 and 500 characters.',
                    },
                },
            },
            cryptoTip: {
                type: DataTypes.DECIMAL(10, 6), // ✅ Using DECIMAL to avoid floating point rounding issues
                allowNull: false,
                defaultValue: 0.0,
                validate: {
                    min: {
                        args: [0],
                        msg: 'CryptoTip cannot be negative.',
                    },
                },
            },
            read: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false, // ✅ Messages are unread by default
            },
            readAt: {
                type: DataTypes.DATE,
                allowNull: true, // ✅ Optional timestamp set when message is read
            },
            attachmentPath: {
                type: DataTypes.STRING,
                allowNull: true, // ✅ #3 Allow optional file attachment for messages
                validate: {
                    len: {
                        args: [0, 255],
                        msg: 'Attachment path must be under 255 characters.',
                    },
                },
            },
              // ✅ Add the new field here
            notificationId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                model: 'Notifications',
                key: 'id',
                },
                onDelete: 'SET NULL',
            },
            },
        {
            timestamps: true, // ✅ Automatically includes createdAt and updatedAt
            paranoid: true,   // ✅ Enables soft deletes
            indexes: [
                { fields: ['senderId'] },     // ✅ Optimize sender queries
                { fields: ['recipientId'] },  // ✅ Optimize recipient inbox lookups
                { fields: ['read'] },         // ✅ Optimize unread message queries
            ],
        }
    );

    // **Associations**
    Message.associate = function (models) {
        Message.belongsTo(models.User, {
            as: 'sender',
            foreignKey: 'senderId',
            onDelete: 'CASCADE',
        });

        Message.belongsTo(models.User, {
            as: 'recipient',
            foreignKey: 'recipientId',
            onDelete: 'CASCADE',
        });
    };

    // ✅ Hook: Prevent users from messaging themselves
    Message.beforeCreate(async (message) => {
        if (message.senderId === message.recipientId) {
            throw new Error('Users cannot send messages to themselves.');
        }
    });

    // ✅ Hook: Auto-set `readAt` when message is marked as read
    Message.beforeUpdate(async (message) => {
        if (message.read && !message.readAt) {
            message.readAt = new Date();
        }
    });

    return Message;
};

/**
 * Potential Improvements & Optimizations for the Message Model
✅ Add Indexing for Faster Querying

- senderId, recipientId, and read are indexed to optimize message retrieval.

✅ Prevent Users from Messaging Themselves

- senderId !== recipientId enforced via a beforeCreate hook.

✅ Set readAt Automatically When Message is Read

- Hook auto-sets timestamp on update.

✅ Soft Deletes Enabled

- paranoid: true allows message recovery instead of permanent deletion.
 */