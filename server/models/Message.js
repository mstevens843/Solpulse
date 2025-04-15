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
                type: DataTypes.DECIMAL(10, 6), //  Using DECIMAL to avoid floating point rounding issues
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
                defaultValue: false, //  Messages are unread by default
            },
            readAt: {
                type: DataTypes.DATE,
                allowNull: true, //  Optional timestamp set when message is read
            },
            attachmentPath: {
                type: DataTypes.STRING,
                allowNull: true, // Allow optional file attachment for messages
                validate: {
                    len: {
                        args: [0, 255],
                        msg: 'Attachment path must be under 255 characters.',
                    },
                },
            },

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
            timestamps: true, 
            paranoid: true,   
            indexes: [
                { fields: ['senderId'] },   
                { fields: ['recipientId'] }, 
                { fields: ['read'] },        
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
        Message.belongsTo(models.Notification, {
            as: 'notification',
            foreignKey: 'notificationId',
            onDelete: 'SET NULL',
        });
    };

    Message.beforeCreate(async (message) => {
        if (message.senderId === message.recipientId) {
            throw new Error('Users cannot send messages to themselves.');
        }
    });

    Message.beforeUpdate(async (message) => {
        if (message.read && !message.readAt) {
            message.readAt = new Date();
        }
    });

    return Message;
};

