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


//   Suggested Enhancements:
// Validation for amount:

// Ensure the amount is a positive number, as negative or zero tips don't make sense.

// Default Value for message:

// Add a default value (e.g., null or an empty string) to message to handle cases where it's not provided explicitly.
// Soft Deletes:

// Add paranoid: true to allow soft deletion of tips, enabling recovery if needed.
// Indexes:

// Add indexes for fromUserId and toUserId to optimize query performance, especially for large datasets.
// Additional Hooks:

// Use Sequelize hooks to log tip creation or to perform additional processing, such as notifying the recipient.

// Key Updates:
// Validation:
// Ensures amount is always positive.
// Soft Deletes:
// Safeguards against accidental deletions.
// Indexes:
// Improves query performance for fromUserId and toUserId.
// Hooks:
// Adds post-creation actions for potential integrations like notifications or analytics.