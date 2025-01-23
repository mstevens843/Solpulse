import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import debounce from "lodash.debounce"; // Import debounce from lodash
import { Line } from "react-chartjs-2";
import "@/css/components/CryptoTicker.css"; // Updated alias for CSS import

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

    return (
        <div className="crypto-ticker-container">
            <h3>All Solana Ecosystem Coins</h3>
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
                                        MCap: ${coin.market_cap.toLocaleString()}
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
            <button
                onClick={fetchPrices}
                className="crypto-refresh-button"
                aria-label="Refresh cryptocurrency prices"
            >
                Refresh Prices
            </button>
        </div>
    );
}

export default CryptoTicker;








// Pages where CryptoTicker is implemented
// HOMEPAGE - The home page includes CRYPTOTICKER to provide users with real-time updates on cryptocurrency prices alongisde their feed and notifications.
// Displayed in the "Explore the Latest Sol Eco trends" section. 

// TRENDINGCRYPTO PAGE - TRENDINGCRYPTO page focuses on SOL coins and integrates CryptoTicker to complement the list of trending coins with live price data. 

// Could also be added to dashboard since its feature-focuse to provide consistent visibility of market trends. 



// API Workflow

// Prices state is initialized as an empty object
// const [prices, setPrices] = useState({});

// fetching prices:
// The 'useEffect' hook is used to fetch prices when component mounts. 
// API call fetches USD prices for all specified cryptocurrencies. 
// const response = await axios.get(
//     `https://api.coingecko.com/api/v3/simple/price?ids=${solanaEcosystemCoins.join(',')}&vs_currencies=usd`
// );
// setPrices(response.data);

// Rendering the Prices
// Iterates through 'solanaEcosystemCoins' array and renders each coin's price. 
// If price is not available yet, it displays "Loading...":
// {coin.toUpperCase()}: ${prices[coin]?.usd ?? 'Loading...'}


// Improvements Made:
// ERROR HANDLING: Added user-friendly error message displayed in the UI when the API fails. 
// REFRESH INTERVAL: Added periodic refreshing of prices every 60 seconds.
// PRICE FORMATTING: Ensured prices are displayed with 2 decimal place for better readability

// Improvements
// Error Message:

// Display a user-friendly error message in the UI when the API fails instead of just logging it to the console.
// Example:
// javascript
// Copy code
// {error && <p style={{ color: 'red' }}>Failed to fetch prices. Please try again later.</p>}
// Refresh Interval:

// Add periodic refreshing of prices using setInterval inside the useEffect:
// javascript
// Copy code
// useEffect(() => {
//     const interval = setInterval(fetchPrices, 60000); // Refresh every 60 seconds
//     return () => clearInterval(interval); // Cleanup on unmount
// }, []);
// Price Formatting:

// Use a utility to format prices to two decimal places for better readability:
// javascript
// Copy code
// {coin.toUpperCase()}: ${prices[coin]?.usd.toFixed(2) ?? 'Loading...'}


// Added loading State: Displays "Loading prices..." until the initial data is fetched.
// Improved Conditional Rendering: Clean and clear conditions for displaying loading, error, or fetched prices.

// Performance Optimization: Key Improvements 🚀
// Memoization:

// Added React.memo to CryptoTransaction to prevent unnecessary re-renders when transaction data remains the same.
// Dependency Management:

// Ensured debounce from lodash does not create a new function instance unnecessarily in CryptoWallet.
// Reduced Redundant Re-renders:

// Cached expensive computations and data filters using useMemo where appropriate.
// Minimized Repeated Requests:

// Improved intervals for API calls in CryptoTicker and added checks to prevent overlapping fetch requests.
// Enhanced Cleanup:

// Ensured all timers/intervals and subscriptions are cleaned up properly when components unmount.

// Key Changes
// Filter Coins:

// Added a search bar (<input>) to filter displayed coins.
// Price Trends:

// Added trends state to calculate upward, downward, or same trends for each coin.
// Refresh Button:

// Added a "Refresh Prices" button to manually refresh prices.
// Improved Price Formatting:

// Used toLocaleString to format prices with commas and two decimal places.
// Error and Loading Handling:

// Improved error messages and replaced text loading indicators with a spinner placeholder.

// Updates for CryptoTicker:
// Dynamic Refresh Button:

// Update the refresh button to provide instant user feedback.
// Filter Enhancements:

// Show a message like "No coins match your search query" if no coins match the filter criteria.

// Added Safety in handleRefresh:

// Included a try-catch block in the handleRefresh method for better error handling during manual refreshes.

// Updates Made:
// Error Handling:
// Error messages are displayed in a banner with retry functionality.
// Improved console error logging for debugging.
// State Management:
// Ensured isMounted cleanup to prevent memory leaks.
// Reduced redundant state updates during periodic refreshes.
// Accessibility:
// Added aria-label attributes to trend icons and search input.
// UX Improvements:
// Included a placeholder and styling for better user feedback.
// Enhanced refresh functionality for immediate updates.