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




// TrendingCoin Model (Optional)
// Changes:
// Introduced a TrendingCoin model:
// This model is designed for optional caching of trending coins fetched from the CoinGecko API.
// Fields include:
// id: Primary key for the coin's unique ID (from CoinGecko).
// name: Coin's full name.
// symbol: Coin's ticker symbol (e.g., SOL).
// currentPrice: The latest price in USD.
// lastUpdated: Timestamp for when the coin's data was last refreshed.
// Rationale:
// If CoinGecko rate limits become an issue or API calls are expensive, caching can improve performance.
// A database table ensures consistent and reliable access to coin data.