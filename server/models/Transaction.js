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






//   1. Displaying Transaction Details
//   If the frontend displays transaction details, ensure it matches the new fields (type, status, walletAddress, amount).

//   2. Handling Transaction Status
// If status is a new field, add logic to display or act upon different statuses like pending, completed, or failed.

// 3. Filtering Transactions by Type
// If type is being used (e.g., deposit, withdrawal), add a filter option in the frontend to allow users to view transactions of a specific type.

// 4. Input for Creating Transactions
// If users can initiate transactions (e.g., deposit/withdrawal):

// Add a form for users to input amount, walletAddress, and select a type.
// Send these details via API.

// 5. API Updates
// If the backend supports transaction creation or querying, ensure the frontend calls the appropriate endpoints.

// 6. Notifications (Optional)
// If you added hooks for notifications in the backend, integrate these on the frontend to show real-time updates for transaction status.


// Changes Made:
// Validation Enhancements:

// Added notEmpty validation to walletAddress.
// Used a regex to validate wallet address format (optional but useful for common crypto formats).
// Ensured amount is a positive float with a minimum value.
// Restricted type and status to specific ENUM values for consistency.
// Default Values:

// Added a default value for status to start as 'pending'.
// Additional Fields:

// Introduced referenceId as a unique field for better transaction tracking.
// Added description to allow an optional user-provided explanation.
// Soft Deletes:

// Enabled paranoid mode for soft deletes, ensuring records can be restored if needed.
// Associations:

// Ensured a proper cascade delete for transactions when a user is deleted.