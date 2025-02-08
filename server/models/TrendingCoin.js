module.exports = (sequelize, DataTypes) => {
    const TrendingCoin = sequelize.define('TrendingCoin', {
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
            allowNull: false,
        },
        currentPrice: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        marketCap: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        priceChangePercentage24h: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        lastUpdated: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    });

    return TrendingCoin;
};