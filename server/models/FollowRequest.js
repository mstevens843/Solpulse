'use strict';

module.exports = (sequelize, DataTypes) => {
  const FollowRequest = sequelize.define(
    'FollowRequest',
    {
      requesterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
      },
      targetId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
      },
      status: {
        type: DataTypes.ENUM('pending', 'accepted', 'denied'),
        allowNull: false,
        defaultValue: 'pending',
      },
      notificationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: 'FollowRequests',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['requesterId', 'targetId'],
        },
      ],
    }
  );

  FollowRequest.associate = (models) => {
    FollowRequest.belongsTo(models.User, {
      as: 'requester',
      foreignKey: 'requesterId',
      onDelete: 'CASCADE',
    });

    FollowRequest.belongsTo(models.User, {
      as: 'target',
      foreignKey: 'targetId',
      onDelete: 'CASCADE',
    });

    FollowRequest.belongsTo(models.Notification, {
      as: 'notification',
      foreignKey: 'notificationId',
      onDelete: 'SET NULL',
    });
  };

  return FollowRequest;
};
