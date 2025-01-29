import React, { useState, useEffect, useMemo, useCallback } from "react";
import debounce from "lodash/debounce";
import CryptoTransaction from "./CryptoTransactions";
import Loader from "../Loader";
import { api } from "@/api/apiConfig"; // Backend API
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import "@/css/components/Crypto_components/CryptoWallet.css"; // Updated alias for CSS import

    const wallet = useWallet();
    const connection = new Connection("https://solana-mainnet.g.alchemy.com/v2/dhWoE-s3HVNfalBWpWnzRIWfyJIqTamF");
    const lamportsToSol = (lamports) => lamports / 1e9;


    const getWalletTransactions = async (walletAddress) => {
        try {
          const publicKey = new solanaWeb3.PublicKey(walletAddress);
          
          // Fetch latest transactions (confirmed)
          const signatures = await connection.getConfirmedSignaturesForAddress2(publicKey, {
            limit: 10, // Adjust as needed
          });
      
          if (signatures.length === 0) {
            return [];
          }
      
          // Fetch transaction details
          const transactions = await Promise.all(
            signatures.map((tx) => connection.getTransaction(tx.signature, { commitment: "confirmed" }))
          );
      
          // Format transactions for frontend
          return transactions.map((tx, index) => ({
            id: index + 1,
            amount: tx.meta?.preBalances[0] ? lamportsToSol(tx.meta.preBalances[0]) : 0,
            type: tx.meta?.err ? "Failed" : "Transfer",
            date: new Date(tx.blockTime * 1000).toISOString(),
          }));
        } catch (error) {
          console.error("❌ Error fetching transactions:", error.message);
          return [];
        }
      };

      function CryptoWallet({ walletConnected }) {
        const [balance, setBalance] = useState(0);
        const [transactions, setTransactions] = useState([]);
        const [wallets, setWallets] = useState([]);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState("");
        const [filter, setFilter] = useState("all");
        const [sortOrder, setSortOrder] = useState("latest");
    
        const wallet = useWallet();
    


        const fetchWalletData = useCallback(
            debounce(async () => {
                setLoading(true);
                setError("");
                try {
                    const token = localStorage.getItem("token");
                    if (!token) {
                        throw new Error("No authentication token found. Please log in.");
                    }
    
                    let fetchedWallets = [];
                    if (wallet.connected && wallet.publicKey) {
                        const publicKey = wallet.publicKey.toBase58();
                        console.log("Fetching wallet data for:", publicKey);
    
                        const balanceLamports = await connection.getBalance(wallet.publicKey);
                        const balanceSOL = lamportsToSol(balanceLamports);
    
                        fetchedWallets = [{ address: publicKey, balance: balanceSOL }];
                        setWallets(fetchedWallets);
                        setBalance(balanceSOL);
                    } else {
                        const { data } = await api.get("/wallet", {
                            headers: { Authorization: `Bearer ${token}` },
                        });
    
                        if (!data || !data.wallets) {
                            throw new Error("Invalid response from server");
                        }
    
                        fetchedWallets = data.wallets;
                        setWallets(fetchedWallets);
                        setBalance(fetchedWallets.reduce((acc, wallet) => acc + (wallet.balance || 0), 0));
                    }
    
                    const allTransactions = await Promise.all(
                        fetchedWallets.map(async (wallet) => {
                            const onChainTxs = await getWalletTransactions(wallet.address);
                            const backendTxs = await api.get(`/transactions/wallet/${wallet.address}`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            return [...onChainTxs, ...(backendTxs.data.transactions || [])];
                        })
                    );
    
                    setTransactions(allTransactions.flat());
    
                } catch (err) {
                    console.error("Error fetching wallet data:", err.message || err);
                    setError("Failed to load wallet data. Please check your connection and try again.");
                } finally {
                    setLoading(false);
                }
            }, 300),
            [wallet.connected, wallet.publicKey]
        );
    
        useEffect(() => {
            if (walletConnected) {
                localStorage.setItem("walletConnected", "true");
                fetchWalletData();
            }
        }, [walletConnected]);
    
        const formattedBalance = useMemo(() => balance.toFixed(2), [balance]);
    
        const filteredTransactions = useMemo(() => {
            return transactions
                .filter((tx) => (filter === "all" ? true : tx.type === filter))
                .sort((a, b) => (sortOrder === "latest" ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)));
        }, [transactions, filter, sortOrder]);
      
    return (
        <div className="crypto-wallet-container">
            <h2 className="crypto-wallet-heading">Your Crypto Wallet</h2>

            {!walletConnected ? (
                <button className="connect-wallet-btn">
                    Connect Wallet
                </button>
            ) : (
                <>
                    {error && (
                        <div className="crypto-wallet-error">
                            <p>{error}</p>
                            <button onClick={fetchWalletData} className="retry-button">
                                Retry
                            </button>
                        </div>
                    )}

                    {loading && <Loader />}

                    {!loading && !error && (
                        <>
                             <p className="crypto-wallet-balance">Total Balance: {formattedBalance} SOL</p>

                            <div className="wallets-list">
                                <h3>Your Wallets</h3>
                                <ul>
                                    {wallets.length > 0 ? (
                                        wallets.map((wallet) => (
                                            <li key={wallet.address} className="wallet-item">
                                                <strong>Address:</strong> {wallet.address} |
                                                <strong> Balance:</strong> {wallet.balance.toFixed(2)} SOL
                                            </li>
                                        ))
                                    ) : (
                                        <p>No wallets found.</p>
                                    )}
                                </ul>
                            </div>

                            <div className="crypto-wallet-controls">
                                <label htmlFor="filter" className="sr-only">Filter transactions by type</label>
                                <select
                                    id="filter"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="crypto-wallet-filter"
                                >
                                    <option value="all">All</option>
                                    <option value="sent">Sent</option>
                                    <option value="received">Received</option>
                                    <option value="tip">Tips</option>
                                </select>

                                <label htmlFor="sortOrder" className="sr-only">Sort transactions</label>
                                <select
                                    id="sortOrder"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="crypto-wallet-sort"
                                >
                                    <option value="latest">Latest First</option>
                                    <option value="oldest">Oldest First</option>
                                </select>

                                <button
                                    onClick={fetchWalletData}
                                    className="crypto-wallet-refresh"
                                    disabled={loading}
                                >
                                    {loading ? "Refreshing..." : "Refresh"}
                                </button>
                            </div>

                            <ul className="crypto-wallet-transactions">
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((tx) => <CryptoTransaction key={tx.id} transaction={tx} />)
                                ) : (
                                    <p className="no-transactions-message">No transactions available.</p>
                                )}
                            </ul>
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default CryptoWallet;
