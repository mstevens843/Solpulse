import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Line } from "react-chartjs-2";
import { Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement,} from "chart.js";
import { api } from "@/api/apiConfig";
import debounce from "lodash.debounce"; 
import Loader from "@/components/Loader";
import "@/css/pages/TrendingCrypto.css";


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);


function TrendingCrypto() {
    const [coins, setCoins] = useState(
        JSON.parse(localStorage.getItem("trendingCoins")) || []
    );
    const [gainers, setGainers] = useState([]);
    const [losers, setLosers] = useState([]);
    const [nfts, setNfts] = useState([]);
    const [trendingSearch, setTrendingSearch] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState("");
    const [selectedCoin, setSelectedCoin] = useState("solana");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState()
    const [loadingCoins, setLoadingCoins] = useState(false);
    const [loadingGainersLosers, setLoadingGainersLosers] = useState(false);
    const [loadingNFTs, setLoadingNFTs] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [loadingChart, setLoadingChart] = useState(false);
    const [globalChartData, setGlobalChartData] = useState(null);
    
    // Helper function to delay requests
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Fetch market chart data
    const fetchMarketChartData = async (coinId) => {
        try {
            setLoadingChart(true);
            console.log(`Fetching chart data for: ${coinId}`);
            const response = await api.get(`/trendingCrypto/chart/${coinId}`);
            console.log("Chart data response:", response.data);
    
            if (!response.data || !response.data.prices || response.data.prices.length === 0) {
                throw new Error("Invalid chart data received");
            }
    
            const prices = response.data.prices.map(price => ({
                x: new Date(price[0]).toLocaleDateString(),
                y: price[1],
            }));
    
            setChartData({
                labels: prices.map(p => p.x),
                datasets: [
                    {
                        label: `${coinId.toUpperCase()} Price (USD)`,
                        data: prices.map(p => p.y),
                        borderColor: "rgb(75, 192, 192)",
                        backgroundColor: "rgba(75, 192, 192, 0.2)",
                    },
                ],
            });
    
            // Clear error on successful data fetch
            setError("");
        } catch (err) {
            console.error("Failed to load market chart:", err);
            setError("Failed to load market chart.");
            setChartData(null);  // Ensure no stale data is shown
        } finally {
            setLoadingChart(false);
        }
    };


    // Fetch global market data from the backend API
    const fetchGlobalMarketData = async () => {
        try {
            const response = await api.get("/trendingCrypto/global");
            console.log("Global market data received:", response.data);
            setGlobalChartData({
                labels: ["Bitcoin", "Ethereum", "Others"],
                datasets: [
                    {
                        data: [
                            response.data.bitcoin, 
                            response.data.ethereum, 
                            response.data.others
                        ],
                        backgroundColor: ["#ff9900", "#627EEA", "#888888"], // New colors for better contrast
                        hoverBackgroundColor: ["#ff9900cc", "#627EEAcc", "#888888cc"],
                    },
                ],
            });
        } catch (err) {
            console.error("Failed to load global market data:", err);
            setError("Failed to load global market data.");
        }
    };



    // Fetch trending coins
    const fetchTrendingCoins = async () => {
        try {
            setLoading(true);
            const response = await api.get("/trendingCrypto");
            setCoins(response.data.slice(0, 10));
        } catch (err) {
            setError("Failed to load trending coins.");
        } finally {
            setLoading(false);
        }
    };


    // Fetch gainers and losers with delay
    const fetchGainersLosers = async () => {
        try {
            setLoadingGainersLosers(true);
            await delay(1000);
            const response = await api.get("/trendingCrypto/top-gainers-losers");
            setGainers(response.data.topGainers.slice(0, 10));
            setLosers(response.data.topLosers.slice(0, 10).reverse());
        } catch (err) {
            setError("Failed to load gainers and losers.");
        } finally {
            setLoadingGainersLosers(false);
        }
    };


    // Fetch NFT details by contract address
    const fetchNfts = async () => {
        try {
            setLoadingNFTs(true);
            const response = await api.get("/trendingCrypto/nfts");
            
            const formattedNfts = response.data.map(nft => ({
                id: nft.id || "N/A",
                name: nft.name || "Unknown NFT",
                symbol: nft.symbol || "N/A",
                image: nft.image || "/default-nft.png",
                floor_price: nft.floor_price || "N/A",
                floor_price_native: nft.floor_price_native || "N/A",
                one_day_sales: nft.one_day_sales || 0,
                change_24h: nft.change_24h !== undefined ? nft.change_24h.toFixed(2) : "N/A",
            }));

            setNfts(formattedNfts);
        } catch (err) {
            console.error("Failed to load trending NFTs:", err);
            setError("Failed to load trending NFTs.");
        } finally {
            setLoadingNFTs(false);
        }
    };

    // Fetch trending searches
    const fetchSearchResults = async (query) => {
        if (!query) {
            setSearchResults([]);
            return;
        }
    
        try {
            const response = await api.get(`/trendingCrypto/search`, { params: { query } });
            setSearchResults(response.data ? [response.data] : []);
        } catch (error) {
            console.error("Error fetching search results:", error);
        }
    };
        // Debounced search handler
    const debouncedSearch = useCallback(debounce(fetchSearchResults, 500), []);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        debouncedSearch(e.target.value);
    };

    const handleSelectCoin = async (coin) => {
        setSearchQuery("");
        setSearchResults([]);
        try {
            const response = await api.get(`/trendingCrypto/search/${coin.id}`);
            setSelectedCoin(response.data || null);
        } catch (error) {
            console.error("Error fetching selected coin data:", error);
        }
    };

    

    useEffect(() => {
        // Fetch market chart for Solana only once when the page loads
        fetchMarketChartData("solana");
    }, []);  // Empty dependency array ensures it runs only once
    
    useEffect(() => {
        if (selectedCoin) {
            fetchMarketChartData(selectedCoin);
            fetchGlobalMarketData();
        }
    }, [selectedCoin]);
    
    // Function to fetch all data sequentially after Solana chart has loaded
    const fetchAllDataSequentially = async () => {
        await fetchTrendingCoins();
        await delay(2000);
        await fetchNfts();
        await delay(2000);
        await fetchTrendingSearch();
        await delay(2000);
        await fetchGainersLosers();
    };
    
    const filteredCoins = useMemo(() =>
        coins.filter((coin) =>
            coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        [coins, searchQuery]
    );



    

    return (
        <div className="trending-crypto-container">
            <h2>Explore Solana Ecosystem</h2>
    
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search coins..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="crypto-search-input"
                />
                {loadingSearch && <div className="loader"></div>}
                {error && <p className="error-message">{error}</p>}
                {searchResults.length > 0 && !loadingSearch && (
                    <ul className="search-results">
                        {searchResults.map((coin) => (
                            <li key={coin.id} onClick={() => handleSelectCoin(coin)}>
                                <img src={coin.thumb || "/default-coin.png"} alt={coin.name} />
                                {coin.name} ({coin.symbol.toUpperCase()})
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {selectedCoin && selectedCoin.symbol && (
            <div className="selected-coin-info">
                <h3>
                    {selectedCoin.name || "Unknown"} ({selectedCoin.symbol ? selectedCoin.symbol.toUpperCase() : "N/A"})
                </h3>
                <img src={selectedCoin.image || "/default-coin.png"} alt={selectedCoin.name || "Unknown"} />
                <p>Price: ${selectedCoin.current_price?.toFixed(2) || "N/A"}</p>
                <p>Market Cap: ${selectedCoin.market_cap?.toLocaleString() || "N/A"}</p>
                <p>24h Change: {selectedCoin.price_change_24h?.toFixed(2) || "N/A"}%</p>
            </div>
        )}
                
            {(loadingCoins || loadingGainersLosers || loadingNFTs || loadingSearch || loadingChart) && <Loader />}
    
            {/* {error && (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={fetchAllDataSequentially} className="refresh-button">Retry</button>
                </div>
            )}
     */}
            <div className="chart-section">
                <div className="chart-container">
                    <h2>
                        {selectedCoin 
                            ? `${selectedCoin.charAt(0).toUpperCase() + selectedCoin.slice(1)} Price Chart` 
                            : "Select a coin to view chart"}
                    </h2>
                    {chartData ? (
                        <Line 
                            data={{
                                ...chartData,
                                datasets: chartData.datasets.map(dataset => ({
                                    ...dataset,
                                    label: dataset.label.toUpperCase()
                                }))
                            }}
                            options={{
                                plugins: {
                                    legend: { labels: { color: 'black', font: { size: 14 } } }
                                },
                                scales: {
                                    x: { ticks: { color: 'black' } },
                                    y: { ticks: { color: 'black' } }
                                }
                            }}
                        />
                    ) : (
                        <p>Loading chart...</p>
                    )}
    
                    <div className="coin-selection">
                        <button onClick={() => setSelectedCoin("bitcoin")} className="trade-button">Bitcoin</button>
                        <button onClick={() => setSelectedCoin("ethereum")} className="trade-button">Ethereum</button>
                        <button onClick={() => setSelectedCoin("solana")} className="trade-button">Solana</button>
                    </div>
                </div>
    
                <div className="chart-container-2">
                    <h2>Global Cryptocurrency Market Dominance</h2>
                    {globalChartData ? (
                        <Doughnut
                            data={globalChartData}
                            options={{
                                maintainAspectRatio: false,
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: 'top',
                                        labels: {
                                            color: "white",
                                            font: { size: 14 }
                                        }
                                    },
                                    datalabels: {
                                        color: "white",
                                        font: {
                                            size: 18,
                                            weight: 'bold'
                                        },
                                        formatter: (value, context) => {
                                            let dataset = context.chart.data.datasets[0].data;
                                            let total = dataset.reduce((acc, data) => acc + parseFloat(data), 0);
                                            let percentage = ((value / total) * 100).toFixed(1) + "%";
                                            return percentage; // Display percentage inside each slice
                                        },
                                        anchor: 'center',
                                        align: 'center'
                                    }
                                },
                                cutout: '60%',
                                layout: {
                                    padding: {
                                        left: 20,
                                        right: 20,
                                        top: 10,
                                        bottom: 30
                                    }
                                }
                            }}
                        />
                    ) : (
                        <p>Loading global market data...</p>
                    )}
                </div>
            </div>
        
            <div className="trending-crypto-lists">
                <section className="trending-list-container trending-coins">
                    <h2>Trending Coins</h2>
                    <ul className="coins-list">
                        {filteredCoins.map((coin) => (
                            <li key={coin.id} className="coin-item">
                                <img className="crypto-coin-image" src={coin.image || "/default-coin.png"} alt={coin.name} />
                                <div className="coin-details">
                                    <span className="coin-name">{coin.name} ({coin.symbol.toUpperCase()})</span>
                                    <span className="coin-price">${coin.current_price.toFixed(2)}</span>
                                </div>
                                <button className="trade-button-trending" onClick={() => setSelectedCoin(coin.symbol)}>Trade</button>
                            </li>
                        ))}
                    </ul>
                    <button onClick={fetchTrendingCoins} className="refresh-button">Load Trending Coins</button>
                </section>
    
                <section className="trending-list-container">
                    <h2>Top Gainers</h2>
                    <ul className="coins-list">
                        {gainers.map((coin) => (
                            <li key={coin.id} className="coin-item">
                                {coin.name} ({coin.symbol.toUpperCase()}) - ${coin.current_price.toFixed(2)}
                                <span className="crypto-change-positive">(+{coin.price_change_percentage_24h.toFixed(2)}%)</span>
                            </li>
                        ))}
                    </ul>
                    <button onClick={fetchGainersLosers} className="refresh-button">Load Top Gainers</button>
                </section>
    
                <section className="trending-list-container">
                    <h2>Top Losers</h2>
                    <ul className="coins-list">
                        {losers.map((coin) => (
                            <li key={coin.id} className="coin-item">
                                {coin.name} ({coin.symbol.toUpperCase()}) - ${coin.current_price.toFixed(2)}
                                <span className="crypto-change-negative">({coin.price_change_percentage_24h.toFixed(2)}%)</span>
                            </li>
                        ))}
                    </ul>
                    <button onClick={fetchGainersLosers} className="refresh-button">Load Top Losers</button>
                </section>
            </div>
    
            <button 
                onClick={fetchAllDataSequentially}
                disabled={loadingCoins || loadingGainersLosers || loadingNFTs || loadingSearch} 
                className="refresh-button"
            >
                {(loadingCoins || loadingGainersLosers || loadingNFTs || loadingSearch) ? "Refreshing..." : "Refresh Prices"}
            </button>
        </div>
    );    
}

export default TrendingCrypto;