// components/TrendingCrypto.js
import React, { useState, useEffect, useMemo } from "react";
import { api } from "@/api/apiConfig"; 
import CryptoTicker from "@/components/CryptoTicker"; 
import CryptoTrade from "@/components/CryptoTrade";
import Loader from "@/components/Loader";
import "@/css/components/Crypto_components/TrendingCrypto.css";

function TrendingCrypto() {
    const EXCLUSION_LIST = ["USDC", "Ethena USDe", "Binance Staked SOL"];
    const [coins, setCoins] = useState(
        JSON.parse(localStorage.getItem("trendingCoins")) || []
    );
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(!coins.length);
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [gainers, setGainers] = useState([]);
    const [losers, setLosers] = useState([]);
    const [nfts, setNfts] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchTrendingData = async () => {
        setLoading(true);
        setError("");
        try {
            const [
                coinsResponse,
                gainersLosersResponse,
                nftsResponse
            ] = await Promise.all([
                api.get("/trendingCrypto"),
                api.get("/trendingCrypto/top-gainers-losers"),
                api.get("/trendingCrypto/nfts"),
            ]);

            // Process coins
            const filteredCoins = coinsResponse.data.filter(
                (coin) => !EXCLUSION_LIST.includes(coin.name)
            );
            setCoins(filteredCoins);
            localStorage.setItem("trendingCoins", JSON.stringify(filteredCoins));

            // Process top gainers and losers
            setGainers(gainersLosersResponse.data.topGainers.slice(0, 10));
            setLosers(gainersLosersResponse.data.topLosers.slice(0, 10));

            // Process top NFTs by floor price change
            setNfts(
                nftsResponse.data
                    .sort((a, b) => b.floor_price_change_percentage_24h - a.floor_price_change_percentage_24h)
                    .slice(0, 10)
            );

        } catch (err) {
            console.error("Error fetching trending data:", err);
            setError("Failed to fetch trending data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!coins.length) {
            fetchTrendingData();
        }
    }, [coins.length]);

    const filteredCoins = useMemo(
        () =>
            coins.filter(
                (coin) =>
                    coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        [coins, searchQuery]
    );

    return (
        <div className="trending-crypto-container">
            <h2 className="text-3xl font-bold text-center mb-6">Trending Solana Ecosystem Coins</h2>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search coins..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400"
                />
            </div>

            {loading && <Loader />}
            {error && (
                <div className="text-center text-red-500">
                    <p>{error}</p>
                    <button 
                        onClick={fetchTrendingData} 
                        className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
                    >
                        Retry
                    </button>
                </div>
            )}

            {!loading && !error && (
                <>
                    <section className="mt-8">
                        <h3 className="text-2xl font-semibold text-green-400 mb-4">Top 10 Gainers</h3>
                        <ul className="gainers-list">
                            {gainers.map((coin) => (
                                <li key={coin.id} className="gainer-item">
                                    {coin.name} ({coin.symbol.toUpperCase()}) - 
                                    <span className="text-green-400"> +{coin.price_change_percentage_24h.toFixed(2)}%</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="mt-8">
                        <h3 className="text-2xl font-semibold text-red-400 mb-4">Top 10 Losers</h3>
                        <ul className="losers-list">
                            {losers.map((coin) => (
                                <li key={coin.id} className="loser-item">
                                    {coin.name} ({coin.symbol.toUpperCase()}) - 
                                    <span className="text-red-400"> {coin.price_change_percentage_24h.toFixed(2)}%</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="mt-8">
                        <h3 className="text-2xl font-semibold text-yellow-400 mb-4">Top 10 NFTs</h3>
                        <ul className="nft-list">
                            {nfts.map((nft) => (
                                <li key={nft.id} className="nft-item">
                                    {nft.name} - 
                                    <span className="text-yellow-400"> {nft.floor_price_change_percentage_24h?.toFixed(2) || "N/A"}%</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="mt-10">
                        <h3 className="text-2xl font-semibold text-gray-400 mb-4">All Coins</h3>
                        <ul className="coins-list">
                            {filteredCoins.map((coin) => (
                                <li key={coin.id} className="coin-item">
                                    <img
                                        src={coin.image || `${api.defaults.baseURL}/default-coin.png`}
                                        alt={coin.name}
                                        className="crypto-coin-image"
                                        onError={(e) => (e.target.src = `${api.defaults.baseURL}/default-coin.png`)}
                                    />
                                    <div className="coin-details">
                                        <span className="coin-name">{coin.name} ({coin.symbol.toUpperCase()})</span>
                                        <span className="coin-price">${coin.current_price.toFixed(2)}</span>
                                    </div>
                                    <button onClick={() => setSelectedCoin(coin.symbol)} className="trade-button">
                                        Trade {coin.symbol.toUpperCase()}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </section>
                </>
            )}

            <button 
                onClick={fetchTrendingData} 
                disabled={refreshing}
                className={`mt-6 py-3 px-6 rounded-lg text-white ${refreshing ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"}`}
            >
                {refreshing ? "Refreshing..." : "Refresh Prices"}
            </button>

            <CryptoTicker />
            {selectedCoin && <CryptoTrade selectedCoin={selectedCoin} />}
        </div>
    );
}

export default TrendingCrypto;