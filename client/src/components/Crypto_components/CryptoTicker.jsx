/**
 * CryptoTicker.js
 *
 * This file is responsible for displaying real-time cryptocurrency prices
 * for the Solana ecosystem, utilizing the CoinGecko API.
 *
 * It allows users to:
 * - View a list of top Solana-based cryptocurrencies ranked by market cap.
 * - Search for specific coins using a debounce-filtered input.
 * - Click on a coin to view its 7-day price trend in a modal.
 * - Refresh prices automatically every 60 seconds.
 */



import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import { Line } from "react-chartjs-2";
import "@/css/components/Crypto_components/CryptoTicker.css"; 
import ModalComponent from './CryptoChartModal/';

const excludedCoins = [
    "usdc",
    "ethena-usde",
    "binance-staked-sol",
    "usdt",
    "usds",
    "coinbase-wrapped-btc",
    "tether",
];

function CryptoTicker({ isCompact = false }) {
    const [coins, setCoins] = useState([]);
    const [filter, setFilter] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [chartData, setChartData] = useState(null);
    const [chartLoading, setChartLoading] = useState(false);
    const [timeframe, setTimeframe] = useState(7); // Default to 7 days
    const [sortCriteria, setSortCriteria] = useState('market_cap_desc'); // Default sorting by market cap



    /**
     * Formats price display with appropriate decimal places.
     * - `BONK` uses 10 decimal places.
     * - Other coins default to 2 decimal places.
     */
    const formatPrice = (price, symbol) => {
        const decimals = symbol.toLowerCase() === "bonk" ? 10 : 2;
        return price?.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }) || "N/A";
    };




    /**
     * Fetches the latest cryptocurrency prices.
     * - Uses CoinGecko's API for Solana ecosystem coins.
     * - Filters out stablecoins and irrelevant assets.
     */
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


    /**
     * Fetches historical price data for a selected coin (last 7 days).
     * - Calls CoinGecko's `market_chart` endpoint.
     * - Formats data for Chart.js.
     */
    const fetchChartData = async (coinId, days) => {
        setChartLoading(true);
        try {
          const response = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
            {
              params: {
                vs_currency: 'usd',
                days: days,
              },
            }
          );
    
          const prices = response.data.prices.map(([timestamp, price]) => ({
            x: new Date(timestamp),
            y: price,
          }));
    
          setChartData({
            labels: prices.map((point) => point.x.toLocaleDateString()),
            datasets: [
              {
                label: `${selectedCoin.name} Price (Last ${days} Days)`,
                data: prices.map((point) => point.y),
                borderColor: '#6366F1',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                fill: true,
              },
            ],
          });
        } catch (err) {
          console.error('Error fetching chart data:', err);
          setChartData(null);
        } finally {
          setChartLoading(false);
        }
      };


    /**
     * Handles coin selection to show price chart modal.
     */
    const handleCoinClick = (coin) => {
        setSelectedCoin(coin);
        setShowModal(true);
        fetchChartData(coin.id);
    };
    
    /**
     * Closes the modal and resets selected coin data.
     */
    const closeModal = () => {
        setShowModal(false);
        setSelectedCoin(null);
        setChartData(null);
    };


    /**
     * Debounced input handler for filtering coins by name.
     */
    const handleFilterChange = debounce((value) => {
        setFilter(value.toLowerCase());
    }, 300); // Debounce input with 300ms delay

    
      const handleTimeframeChange = (event) => {
        const days = parseInt(event.target.value, 10);
        setTimeframe(days);
        if (selectedCoin) {
          fetchChartData(selectedCoin.id, days);
        }
      };
    
      const handleSortChange = (event) => {
        setSortCriteria(event.target.value);
      };


    /**
     * Runs on mount to fetch initial data and set up auto-refresh every 60s.
     */
    useEffect(() => {
        fetchPrices();
        const intervalId = setInterval(fetchPrices, 60000);
        return () => {
            clearInterval(intervalId);
            fetchPrices.cancel(); // Cancel any pending fetches
        };
    }, [fetchPrices]);


    /**
     * Formats market cap into readable units (Billion, Million).
     */
    const formatMarketCap = (marketCap) => {
        if (marketCap >= 1_000_000_000) {
            return `${(marketCap / 1_000_000_000).toFixed(2)}B`;
        } else if (marketCap >= 1_000_000) {
            return `${(marketCap / 1_000_000).toFixed(2)}M`;
        } else {
            return `$${Number(marketCap).toLocaleString()}`;
        }
    };


    const sortedCoins = [...coins]
  .filter((coin) =>
    coin.name.toLowerCase().includes(filter)
  )
  .sort((a, b) => {
    switch (sortCriteria) {
      case "price_desc":
        return b.current_price - a.current_price;
      case "price_asc":
        return a.current_price - b.current_price;
      case "percent_change_desc":
        return (
          b.price_change_percentage_24h - a.price_change_percentage_24h
        );
      case "percent_change_asc":
        return (
          a.price_change_percentage_24h - b.price_change_percentage_24h
        );
      case "market_cap_asc":
        return a.market_cap - b.market_cap; // Added: Market Cap Low → High
      case "market_cap_desc":
      default:
        return b.market_cap - a.market_cap;
    }
  });

  const tickerHeight = isCompact ? "200px" : "450px"; // dynamic height

    return (
        <div className="crypto-ticker-container">
          <h3>Explore Solana Ecosystem</h3>
      
          {/* Search input */}
          <input
            type="text"
            placeholder="Search coins..."
            onChange={(e) => handleFilterChange(e.target.value)}
            className="crypto-search-input"
            aria-label="Search for a specific cryptocurrency"
          />
      
          {/* Sort dropdown */}
          <div className="sort-row">
            <label htmlFor="sort" className="text-sm font-medium text-white">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortCriteria}
              onChange={handleSortChange}
              className="px-3 py-1 rounded bg-slate-700 text-white"
            >
              <option value="market_cap_desc">Market Cap (High to Low)</option>
              <option value="market_cap_asc">Market Cap (Low to High)</option>
              <option value="price_desc">Price (High to Low)</option>
              <option value="price_asc">Price (Low to High)</option>
              <option value="percent_change_desc">% Change (High to Low)</option>
              <option value="percent_change_asc">% Change (Low to High)</option>
            </select>
          </div>
      
          {/* Loading, Error, Coin List */}
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
            <ul
            className="crypto-price-list"
            style={isCompact ? { height: tickerHeight } : undefined}
          >
              {sortedCoins.map((coin) => (
                <li
                  key={coin.id}
                  className="crypto-price-item"
                  onClick={() => handleCoinClick(coin)}
                >
                  <div className="crypto-left">
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="crypto-coin-image"
                    />
                    <div className="crypto-details">
                      <span className="crypto-name">{coin.name}</span>
                      <span className="crypto-symbol">
                        ({coin.symbol.toUpperCase()})
                      </span>
                    </div>
                    <span className="crypto-price">
                      ${coin.current_price.toFixed(2)}
                    </span>
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
      
          {/* Chart Modal */}
          {showModal && selectedCoin && (
            <ModalComponent
              onClose={closeModal}
              coin={selectedCoin}
              chartData={chartData}
              chartLoading={chartLoading}
              timeframe={timeframe}
              onTimeframeChange={handleTimeframeChange}
            />
          )}
        </div>
      );
      
}

export default CryptoTicker;