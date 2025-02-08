import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import debounce from "lodash.debounce"; // Import debounce from lodash
import { Line } from "react-chartjs-2";
import "@/css/components/Crypto_components/CryptoTicker.css"; // Updated alias for CSS import

const excludedCoins = [
    "usdc",
    "ethena-usde",
    "binance-staked-sol",
    "usdt",
    "usds",
    "coinbase-wrapped-btc",
    "tether",
];

function CryptoTicker() {
    const [coins, setCoins] = useState([]);
    const [filter, setFilter] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [chartData, setChartData] = useState(null);
    const [chartLoading, setChartLoading] = useState(false);

    const formatPrice = (price, symbol) => {
        const decimals = symbol.toLowerCase() === "bonk" ? 10 : 2;
        return price?.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }) || "N/A";
    };

    const fetchPrices = useCallback(
        debounce(async () => {
            setLoading(true);
            setError("");
            try {
                const allCoins = [];
                const maxPages = 1; // Fetch up to 5 pages (50 coins per page = 250 coins)

                for (let page = 1; page <= maxPages; page++) {
                    const response = await axios.get(
                        `https://api.coingecko.com/api/v3/coins/markets`,
                        {
                            params: {
                                vs_currency: "usd",
                                category: "solana-ecosystem",
                                order: "market_cap_desc",
                                per_page: 50, // Max per page
                                page: page,
                            },
                        }
                    );

                    if (response.data.length === 0) {
                        break; // Stop if no more coins are returned
                    }

                    allCoins.push(...response.data);
                }

                // Filter excluded coins
                const filteredCoins = allCoins.filter(
                    (coin) => !excludedCoins.includes(coin.id.toLowerCase())
                );

                setCoins(filteredCoins); // Set the state with up to 250 coins
            } catch (err) {
                console.error("Error fetching prices:", err);
                setError("Failed to fetch prices. Please try again later.");
            } finally {
                setLoading(false);
            }
        }, 5000), // Debounce API calls with a 500ms delay
        []
    );

    const fetchChartData = async (coinId) => {
        setChartLoading(true);
        try {
            const response = await axios.get(
                `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
                {
                    params: {
                        vs_currency: "usd",
                        days: 7,
                    },
                }
            );

            const prices = response.data.prices.map(([timestamp, price]) => ({
                x: new Date(timestamp).toLocaleDateString(),
                y: price,
            }));

            setChartData({
                labels: prices.map((point) => point.x),
                datasets: [
                    {
                        label: `${selectedCoin.name} Price (Last 7 Days)`,
                        data: prices.map((point) => point.y),
                        borderColor: "#6366F1",
                        backgroundColor: "rgba(99, 102, 241, 0.2)",
                        fill: true,
                    },
                ],
            });
        } catch (err) {
            console.error("Error fetching chart data:", err);
            setChartData(null);
        } finally {
            setChartLoading(false);
        }
    };

    const handleCoinClick = (coin) => {
        setSelectedCoin(coin);
        setShowModal(true);
        fetchChartData(coin.id);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedCoin(null);
        setChartData(null);
    };

    const handleFilterChange = debounce((value) => {
        setFilter(value.toLowerCase());
    }, 300); // Debounce input with 300ms delay

    useEffect(() => {
        fetchPrices();
        const intervalId = setInterval(fetchPrices, 60000);
        return () => {
            clearInterval(intervalId);
            fetchPrices.cancel(); // Cancel any pending fetches
        };
    }, [fetchPrices]);

    const formatMarketCap = (marketCap) => {
        if (marketCap >= 1_000_000_000) {
            return `${(marketCap / 1_000_000_000).toFixed(2)}B`;
        } else if (marketCap >= 1_000_000) {
            return `${(marketCap / 1_000_000).toFixed(2)}M`;
        } else {
            return `$${Number(marketCap).toLocaleString()}`;
        }
    };

    return (
        <div className="crypto-ticker-container">
            <h3>Explore Solana Ecosystem</h3>
            <input
                type="text"
                placeholder="Search coins..."
                onChange={(e) => handleFilterChange(e.target.value)}
                className="crypto-search-input"
                aria-label="Search for a specific cryptocurrency"
            />
            {loading ? (
                <div className="crypto-spinner" role="alert" aria-busy="true">
                    Loading prices...
                </div>
            ) : error ? (
                <div className="crypto-error" role="alert">
                    {error}
                    <button
                        onClick={fetchPrices}
                        className="crypto-refresh-button"
                        disabled={loading}
                    >
                        Retry
                    </button>
                </div>
            ) : (
                <ul className="crypto-price-list">
                    {coins
                        .filter((coin) =>
                            coin.name.toLowerCase().includes(filter)
                        )
                        .map((coin) => (
                            <li key={coin.id} className="crypto-price-item">
                                <div className="crypto-left">
                                    <img
                                        src={coin.image}
                                        alt={coin.name}
                                        className="crypto-coin-image"
                                    />
                                    <div className="crypto-details">
                                        <span className="crypto-name">{coin.name}</span>
                                        <span className="crypto-symbol">({coin.symbol.toUpperCase()})</span>
                                    </div>
                                    <span className="crypto-price">${coin.current_price.toFixed(2)}</span>
                                </div>
                                <div className="crypto-price-right">
                                <span className="crypto-marketcap">
                                    MCap: {formatMarketCap(coin.market_cap)}
                                </span>
                                    <span
                                        className={`crypto-change ${
                                            coin.price_change_percentage_24h > 0
                                                ? "crypto-change-positive"
                                                : "crypto-change-negative"
                                        }`}
                                    >
                                        24h: {coin.price_change_percentage_24h?.toFixed(2)}%
                                    </span>
                                </div>
                            </li>
                        ))}
                </ul>
            )}
            {/* <button
                onClick={fetchPrices}
                className="crypto-refresh-button"
                aria-label="Refresh cryptocurrency prices"
            >
                Refresh Prices
            </button> */}
        </div>
    );
}

export default CryptoTicker;