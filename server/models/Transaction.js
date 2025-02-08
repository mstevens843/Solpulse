module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define(
    'Transaction',
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      walletAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Wallet address cannot be empty.' },
          is: {
            args: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/i,
            msg: 'Invalid wallet address format.',
          },
        },
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          isFloat: { msg: 'Amount must be a valid number.' },
          min: { args: [0.01], msg: 'Amount must be at least 0.01.' },
        },
      },
      type: {
        type: DataTypes.ENUM('deposit', 'withdrawal', 'transfer'),
        allowNull: false,
        validate: {
          isIn: {
            args: [['deposit', 'withdrawal', 'transfer']],
            msg: 'Invalid transaction type.',
          },
        },
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
          isIn: {
            args: [['pending', 'completed', 'failed']],
            msg: 'Invalid transaction status.',
          },
        },
      },
      referenceId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: 'Reference ID must be unique.' },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [0, 255],
            msg: 'Description must be at most 255 characters.',
          },
        },
      },
    },
    {
      timestamps: true,
      paranoid: true, // Enables soft deletes
      hooks: {
        beforeValidate(transaction) {
          if (!transaction.referenceId) {
            transaction.referenceId = `REF-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}`;
          }
        },
      },
    }
  );

  Transaction.associate = function (models) {
    Transaction.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
      hooks: true, // Enables cascading delete
      as: 'user',
    });
  };

  return Transaction;
};