module.exports = (sequelize, DataTypes) => {
    const Wallet = sequelize.define(
      'Wallet',
      {
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            notEmpty: true,
            isInt: true,
          },
        },
        address: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            notEmpty: true,
            is: /^[A-Za-z0-9]{32,44}$/i,
          },
        },
        balance: {
          type: DataTypes.FLOAT,
          allowNull: true,
          defaultValue: 0.0,
          validate: {
            isFloat: true,
            min: 0,
          },
        },
      },
      {
        timestamps: true,
        paranoid: true, 
      }
    );
  
    Wallet.associate = function (models) {
      // Wallet belongs to a User
      Wallet.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user', 
        onDelete: 'CASCADE', 
      });
  
      // Wallet has many Transactions
      Wallet.hasMany(models.Transaction, {
        foreignKey: 'walletId', 
        sourceKey: 'id', 
        as: 'transactions',
        onDelete: 'CASCADE',
      });
    };
  
    return Wallet;
  };