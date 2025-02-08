module.exports = (sequelize, DataTypes) => {
  const Tip = sequelize.define(
    'Tip',
    {
      fromUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      toUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          isPositive(value) {
            if (value <= 0) {
              throw new Error('Tip amount must be greater than 0.');
            }
          },
        },
      },
      message: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      hooks: true,
    }
  );

  Tip.associate = function (models) {
    Tip.belongsTo(models.User, {
      foreignKey: 'fromUserId',
      onDelete: 'CASCADE',
      hooks: true,
      as: 'fromUser',
    });
    Tip.belongsTo(models.User, {
      foreignKey: 'toUserId',
      onDelete: 'CASCADE',
      hooks: true,
      as: 'toUser',
    });
  };

  return Tip;
};