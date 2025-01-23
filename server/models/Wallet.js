module.exports = (sequelize, DataTypes) => {
    const Wallet = sequelize.define(
      'Wallet',
      {
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            notEmpty: true,
            isInt: true, // Validate that the userId is an integer
          },
        },
        address: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true, // Ensure wallet addresses are unique
          validate: {
            notEmpty: true, // Ensure the wallet address is not empty
            is: /^[A-Za-z0-9]{32,44}$/i, // Regex for Solana wallet addresses (or other formats)
          },
        },
        balance: {
          type: DataTypes.FLOAT, // Storing balance in SOL (or other tokens)
          allowNull: true,
          defaultValue: 0.0, // Default balance is 0.0
          validate: {
            isFloat: true, // Ensure the balance is a valid float
            min: 0, // Balance cannot be negative
          },
        },
      },
      {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
        paranoid: true, // Enable soft deletes
      }
    );
  
    Wallet.associate = function (models) {
      // Wallet belongs to a User
      Wallet.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user', // Optional alias
        onDelete: 'CASCADE', // Delete wallet if the associated user is deleted
      });
  
      // Wallet has many Transactions
      Wallet.hasMany(models.Transaction, {
        foreignKey: 'walletId', // Correct foreign key
        sourceKey: 'id', // Use the ID as the source key, not the address
        as: 'transactions',
        onDelete: 'CASCADE', // Delete transactions when the wallet is deleted
      });
    };
  
    return Wallet;
  };
  
  
//   Improvements:
//   Validation:
  
//   Added a regex validation for the address field to ensure proper crypto wallet address format.
//   Ensured userId and balance have appropriate validations, including minimum balance restrictions.
//   Default Values:
  
//   Set a default value of 0.0 for the balance field to handle initialization cases.
//   Soft Deletes:
  
//   Enabled paranoid mode to allow for soft deletes of wallets, retaining data for audit purposes.
//   Associations:
  
//   Defined a relationship between Wallet and Transaction using the address as the source key. This ensures a wallet's transactions are tied correctly.
//   Ensured cascading deletes for wallets and their associated transactions when a wallet or user is deleted.