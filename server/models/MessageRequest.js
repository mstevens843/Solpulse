module.exports = (sequelize, DataTypes) => {
    const MessageRequest = sequelize.define('MessageRequest', {
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      recipientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending',
      },
      notificationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    });
  
    MessageRequest.associate = (models) => {
      MessageRequest.belongsTo(models.User, {
        as: 'senderUser',
        foreignKey: 'senderId',
      });
      MessageRequest.belongsTo(models.User, {
        as: 'recipientUser',
        foreignKey: 'recipientId',
      });
  
      MessageRequest.belongsTo(models.Notification, {
        as: 'notification',
        foreignKey: 'notificationId',
        onDelete: 'SET NULL',
      });
    };
  
    return MessageRequest;
  };