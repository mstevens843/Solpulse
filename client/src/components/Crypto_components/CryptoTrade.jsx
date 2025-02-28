import React, { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { api } from "@/api/apiConfig";
import CryptoWalletIntegration from "./CryptoWalletIntegration";
import Loader from "../Loader";
// import "@/css/components/Crypto_components/CryptoTrade.css"; 

function CryptoTrade({ selectedCoin }) {
    const [tradeType, setTradeType] = useState("buy");
    const [amount, setAmount] = useState("");
    const [price, setPrice] = useState(null);
    const [walletBalance, setWalletBalance] = useState(null); // Display wallet balance
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const wallet = useWallet();
    const { connection } = useConnection(); // Solana connection object

    // Fetch current price of the selected cryptocurrency
    const fetchPrice = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/price?coin=${selectedCoin}`);
            setPrice(parseFloat(response.data.price));
            setErrorMessage("");
        } catch (error) {
            console.error("Error fetching price:", error);
            setErrorMessage("Unable to fetch price. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch wallet balance (if wallet is connected)
    const fetchWalletBalance = async () => {
        if (wallet.publicKey) {
            try {
                const balance = await connection.getBalance(wallet.publicKey);
                setWalletBalance(balance / 1e9); // Convert lamports to SOL
            } catch (error) {
                console.error("Error fetching wallet balance:", error);
                setWalletBalance(null);
            }
        }
    };

    useEffect(() => {
        if (selectedCoin) fetchPrice();
        fetchWalletBalance();
    }, [selectedCoin, wallet.publicKey]);

    // Handle trade execution
    const handleTrade = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        if (!wallet.connected || !wallet.publicKey) {
            setErrorMessage("Please connect your Phantom wallet.");
            return;
        }
        

        const tradeAmount = parseFloat(amount);
        if (!tradeAmount || tradeAmount <= 0) {
            setErrorMessage("Please enter a valid trade amount.");
            return;
        }

        if (tradeType === "sell" && walletBalance !== null && tradeAmount > walletBalance) {
            setErrorMessage("Insufficient balance to complete the trade.");
            return;
        }

        try {
            setLoading(true);
            const tradeData = {
                cryptoType: selectedCoin.toUpperCase(),
                amount: tradeAmount,
                tradeType,
            };

            const response = await api.post(`/trade`, tradeData);
            setSuccessMessage(response.data.message || "Trade executed successfully!");
            setAmount("");
        } catch (error) {
            console.error("Trade failed:", error);
            setErrorMessage(
                error.response?.data?.message || "Failed to execute trade. Please try again."
            );
        } finally {
            setLoading(false);
            fetchWalletBalance(); // Refresh wallet balance after trade
        }
    };

    return (
        <div className="crypto-trade-container">
            <h2>Trade {selectedCoin?.toUpperCase() || "Crypto"}</h2>
            <CryptoWalletIntegration />

            <div className="trade-info">
                {loading && <Loader />}
                {!loading && price !== null && (
                    <p>Current Price: ${price.toFixed(2)} USD</p>
                )}
                {walletBalance !== null && (
                    <p>Your Wallet Balance: {walletBalance.toFixed(4)} SOL</p>
                )}
            </div>

            {errorMessage && <p className="trade-error">{errorMessage}</p>}
            {successMessage && <p className="trade-success">{successMessage}</p>}

            <form onSubmit={handleTrade} className="trade-form">
                <label htmlFor="tradeType">
                    Trade Type:
                    <select
                        id="tradeType"
                        value={tradeType}
                        onChange={(e) => setTradeType(e.target.value)}
                        className="trade-select"
                        aria-label="Select trade type"
                    >
                        <option value="buy">Buy</option>
                        <option value="sell">Sell</option>
                    </select>
                </label>
                <label htmlFor="amount">
                    Amount (SOL):
                    <input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="0.01"
                        step="0.01"
                        required
                        className="trade-input"
                        aria-label="Enter trade amount in SOL"
                    />
                </label>
                <button
                    type="submit"
                    className="trade-button"
                    disabled={!wallet.connected || loading}
                >
                    {loading
                        ? "Processing..."
                        : `${tradeType === "buy" ? "Buy" : "Sell"} ${selectedCoin?.toUpperCase()}`}
                </button>
            </form>
        </div>
    );
}

export default CryptoTrade;