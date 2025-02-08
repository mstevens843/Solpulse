import React, { useState, useEffect, useMemo, useCallback } from "react";
import debounce from "lodash/debounce";
import CryptoTransaction from "./CryptoTransactions";
import Loader from "../Loader";
import { Connection, PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import "@/css/components/Crypto_components/CryptoWallet.css";

// Set up Solana RPC connection (Alchemy or Default RPC)
const connection = new Connection("https://solana-mainnet.g.alchemy.com/v2/dhWoE-s3HVNfalBWpWnzRIWfyJIqTamF");

// Convert lamports to SOL
const lamportsToSol = (lamports) => lamports / 1e9;

// Fetch latest 5 transactions for a given wallet address
const getWalletTransactions = async (walletAddress) => {
    try {
        const publicKey = new PublicKey(walletAddress);

        // Fetch latest transactions (limit: 5)
        const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 5 });

        if (!signatures.length) return [];

        // Fetch transaction details
        const transactions = await Promise.all(
            signatures.map(async (tx) => {
                const transactionDetails = await connection.getTransaction(tx.signature, {
                    commitment: "confirmed",
                    maxSupportedTransactionVersion: 0,
                });

                if (!transactionDetails) return null;

                const preBalances = transactionDetails.meta?.preTokenBalances || [];
                const postBalances = transactionDetails.meta?.postTokenBalances || [];

                let tokenName = "SOL"; // Default to SOL
                let amount = 0;
                let type = "Unknown";

                // Check SPL token transfers (non-SOL tokens)
                if (preBalances.length > 0 && postBalances.length > 0) {
                    const tokenPre = preBalances.find(b => b.owner === walletAddress);
                    const tokenPost = postBalances.find(b => b.owner === walletAddress);

                    if (tokenPre && tokenPost) {
                        const preAmount = parseFloat(tokenPre.uiTokenAmount.uiAmount);
                        const postAmount = parseFloat(tokenPost.uiTokenAmount.uiAmount);
                        amount = preAmount - postAmount;
                        tokenName = tokenPre.mint; // Gets the token mint address (can be converted to a symbol if needed)
                    }
                } else {
                    // Default to SOL transfers
                    const preBalance = transactionDetails.meta?.preBalances?.[0] || 0;
                    const postBalance = transactionDetails.meta?.postBalances?.[0] || 0;
                    amount = lamportsToSol(preBalance - postBalance);
                }

                // Determine if Sent or Received
                if (amount > 0) {
                    type = "Sent";
                } else if (amount < 0) {
                    type = "Received";
                    amount = Math.abs(amount);
                } else if (transactionDetails.meta?.err) {
                    type = "Failed";
                }

                return {
                    id: tx.signature,
                    amount,
                    token: tokenName,
                    type,
                    date: transactionDetails.blockTime
                        ? new Date(transactionDetails.blockTime * 1000).toISOString()
                        : "Unknown",
                };
            })
        );

        // Filter out null transactions
        return transactions.filter((tx) => tx !== null);
    } catch (error) {
        console.error("❌ Error fetching transactions:", error.message);
        return [];
    }
};



function CryptoWallet({ walletConnected }) {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
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
                if (wallet.connected && wallet.publicKey) {
                    const publicKey = wallet.publicKey.toBase58();
                    console.log("Fetching wallet data for:", publicKey);

                    // Fetch balance from Phantom wallet
                    const balanceLamports = await connection.getBalance(wallet.publicKey);
                    const balanceSOL = lamportsToSol(balanceLamports);
                    setBalance(balanceSOL);

                    // Fetch latest transactions from Solana blockchain
                    const onChainTxs = await getWalletTransactions(publicKey);
                    setTransactions(onChainTxs);
                } else {
                    throw new Error("No wallet connected");
                }
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
