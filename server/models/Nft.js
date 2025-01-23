module.exports = (sequelize, DataTypes) => {
    const NFT = sequelize.define('NFT', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            unique: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        symbol: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        assetPlatformId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        contractAddress: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    });

    return NFT;
};
