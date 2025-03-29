/**
 * CryptoWallet.js
 *
 * This file is responsible for displaying a user's Solana wallet balance and recent transactions.
 * It integrates with Phantom Wallet, fetches on-chain transactions, and provides filtering & sorting options.
 *
 * Features:
 * - **Solana Blockchain Integration:** Uses `@solana/web3.js` to fetch wallet balance and transactions.
 * - **Real-time Updates:** Periodically refreshes wallet data and supports manual refresh.
 * - **Sorting & Filtering:** Allows users to filter transactions by type (Sent, Received, Tips) and sort by date.
 * - **Optimized Performance:** Uses `useMemo`, `useCallback`, and `debounce` to reduce unnecessary re-renders.
 * - **Error Handling:** Displays meaningful messages when Solana RPC or wallet connection fails.
 */


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
//  * - Includes handling for SOL and SPL token transfers.

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

                // ✅ Get from/to addresses using account keys
                const accountKeys = transactionDetails.transaction?.message?.accountKeys || [];
                const fromAddress = accountKeys[0]?.toBase58?.() || "Unknown"; // ✅ Sender
                const toAddress = accountKeys[1]?.toBase58?.() || "Unknown";   // ✅ Receiver

                // ✅ Get fee and slot
                const fee = lamportsToSol(transactionDetails.meta?.fee || 0); // ✅ Fee in SOL
                const slot = transactionDetails.slot; // ✅ Solana slot

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
                    slot, // ✅ Optimization #4
                    fee,  // ✅ Optimization #6
                    explorerUrl: `https://solscan.io/tx/${tx.signature}`, // ✅ Optimization #1
                    from: fromAddress, // ✅ Optimization #5
                    to: toAddress      // ✅ Optimization #5
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
    const [usdPerSol, setUsdPerSol] = useState(null); // ✅ Store SOL to USD rate

    const wallet = useWallet();


    /**
     * Fetches wallet balance and latest transactions from the Solana blockchain.
     * - Uses `debounce` to reduce API call frequency.
     * - Stores wallet connection state in localStorage.
     */
    const fetchWalletData = useCallback(
        debounce(async () => {
            setLoading(true);
            setError("");

            try {
                if (wallet.connected && wallet.publicKey) {
                    const publicKey = wallet.publicKey.toBase58();
                    console.log("Fetching wallet data for:", publicKey);

                    // ✅ Optimization 1: Check local cache first
                    const cached = localStorage.getItem(`walletCache:${publicKey}`);
                    if (cached) {
                        const { balance: cachedBalance, transactions: cachedTxs, timestamp } = JSON.parse(cached);
                        const isFresh = Date.now() - timestamp < 60_000;
                        if (isFresh) {
                            setBalance(cachedBalance);
                            setTransactions(cachedTxs);
                            setLoading(false);
                            return;
                        }
                    }

                    const balanceLamports = await connection.getBalance(wallet.publicKey);
                    const balanceSOL = lamportsToSol(balanceLamports);
                    setBalance(balanceSOL);

                    const onChainTxs = await getWalletTransactions(publicKey);
                    setTransactions(onChainTxs);

                    // ✅ Store in localStorage
                    localStorage.setItem(
                        `walletCache:${publicKey}`,
                        JSON.stringify({
                            balance: balanceSOL,
                            transactions: onChainTxs,
                            timestamp: Date.now(),
                        })
                    );
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

    // Format balance for display
    const formattedBalance = useMemo(() => balance.toFixed(2), [balance]);

    // Filter and sort transactions
    const filteredTransactions = useMemo(() => {
        return transactions
            .filter((tx) => (filter === "all" ? true : tx.type === filter))
            .sort((a, b) => (sortOrder === "latest" ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)));
    }, [transactions, filter, sortOrder]);


    const handleTransactionClick = (tx) => {
        // ✅ Optimization 2: Placeholder for modal/detail view
        console.log("Transaction clicked:", tx);
    };


    useEffect(() => {
        const fetchSolPrice = async () => {
            try {
                const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
                const data = await res.json();
                const price = data?.solana?.usd;
                if (price) setUsdPerSol(price);
            } catch (err) {
                console.error("❌ Failed to fetch SOL price:", err);
            }
        };
    
        fetchSolPrice();
    
        const interval = setInterval(fetchSolPrice, 60_000); // ✅ Refresh every 1 min
        return () => clearInterval(interval);
    }, []);

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
                                    filteredTransactions.map((tx) => (
                                        <li key={tx.id} onClick={() => handleTransactionClick(tx)} className="transaction-item">
                                            <CryptoTransaction transaction={tx} usdPerSol={usdPerSol} /> {/* ✅ Pass USD value */}
                                        </li>
                                    ))
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


/**
 * 🔹 **Potential Improvements:**
 * - **Cache Data:** Store wallet balance and transactions in localStorage for faster loading.
 * - **Transaction Details:** Allow users to view full transaction metadata.
 * - **Real-time Updates:** Implement WebSocket-based updates instead of polling. - SKIPPED
 * - Added USD to SOL converison 
 */