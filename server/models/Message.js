module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define(
        'Message',
        {
            senderId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            recipientId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            content: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [1, 500], // Limits content to 1-500 characters
                        msg: 'Message content must be between 1 and 500 characters.',
                    },
                },
            },
            cryptoTip: {
                type: DataTypes.FLOAT,
                allowNull: false,
                defaultValue: 0.0, // Default value for crypto tips
                validate: {
                    min: {
                        args: [0], // Ensure tips are non-negative
                        msg: 'CryptoTip cannot be negative.',
                    },
                },
            },
            read: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false, // Initialize messages as unread
            },
            readAt: {
                type: DataTypes.DATE,
                allowNull: true, // Timestamp for when the message is read
            },
        },
        {
            timestamps: true, // Automatically includes createdAt and updatedAt fields
        }
    );

    Message.associate = function (models) {
        Message.belongsTo(models.User, { as: 'sender', foreignKey: 'senderId' }); // Sender relationship
        Message.belongsTo(models.User, { as: 'recipient', foreignKey: 'recipientId' }); // Recipient relationship
    };

    return Message;
};
