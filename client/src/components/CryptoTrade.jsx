// CryptoTrade component provides dynamic interface for buyingand selling a selected crypto. 
// Includes:
// Live Price Updates: Fetches the latest market price for selected cryptocurrency
// Balance Display: Display the user's current balance in the selected crypto
// Trade Execution: Enables users to place market buy or sell orders through the Coinbase API. 

// Validation and Feedback :
// Ensures users have sufficient funds for trades.
// Displays success or error messages based on the trade outcome. 
// DYNAMIC UPDATES: Updates user balance after each trade to reflect the latest account status. 



import React, { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { api } from "@/api/apiConfig"; // Centralized API instance
import CryptoWalletIntegration from "./CryptoWalletIntegration"; // Wallet connection component
import Loader from "./Loader"; // Import your Loader component
import "@/css/components/CryptoTrade.css"; // Updated alias for CSS import

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

        if (!wallet.connected) {
            setErrorMessage("Please connect your wallet first.");
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











// Pages where CRYPTOTRADE is implemented
// TRENDINGCRYPTO PAGE: WHY: allows users to select a crypto from list of trending SOL eco coins. Once a coin is selected, the CryptoTrade component is displayed
// enable trading functionality. 
// Reference: Appears dynamically when a coin is selected for trading, providing real-time pricing and trade options. 



// Imrpovements Made:
// Dynamic Total Cost Update: Total cost now updates dynamically based on entered amount and current price. 
// Error Handling: Enhanced error handling with clear user-friendly messages. 
// Input Validation: Added validation for amount input to ensure positive numbers only. 
// Component Cleanup: Ensured that asynchronous calls are cleaned up properly to unmount. 
// Loading State: Added loading state for price and balance to enhance user experience. 


// Key Updates
// Error and Success Messages:

// Styled error (trade-error) and success messages (trade-success) are displayed below the trade form.
// Loading State:

// Dynamic feedback for loading states during price fetching or trade processing.
// Validation:

// Ensures trade amounts are valid and greater than 0 before processing.
// Dynamic Recipient Wallet:

// Made the recipient wallet dynamic via the recipientWallet prop.

// New Features Added
// getTransactionLabel Function:

// Dynamically maps raw transaction types to user-friendly labels (e.g., "Buy" or "Sell").
// Ensures extensibility for future transaction types.
// Tooltips for Dates:

// Adds a tooltip with the full ISO date to provide additional context for precise timestamps.
// Amount Formatting:

// Ensures transaction amounts are formatted with commas and always show two decimal places for clarity.


// Key Updates:
// Data Alignment with Backend:

// The handleTrade function now sends cryptoType, amount, and tradeType to the backend API.
// Dynamic Coin Selection:

// Updated fetchPrice to support dynamically fetching prices for the selected cryptocurrency.
// Improved Error Handling:

// Added support for displaying error messages returned from the backend API (error.response?.data?.message).
// Validation:

// Ensures amount is greater than 0 and the wallet is connected before initiating a trade.
// Success Messaging:

// Displays the success message returned by the backend or a default confirmation.

// Enhancements Summary:
// Wallet Balance Integration:

// Added Solana wallet balance display using connection.getBalance.
// Error Handling:

// Checked for insufficient balance on sell trades.
// Added error messages for invalid or empty inputs.
// Loading Feedback:

// Displayed real-time loading indicators for price fetching and trade processing.
// Dynamic UI Updates:

// Refreshed wallet balance post-trade to reflect the updated balance.


// Key Updates:
// Dynamic API URL:
// Updated URLs to use process.env.REACT_APP_API_URL for consistency across your project.
// Loader Integration:
// Used the Loader component for a consistent loading experience.
// Validation:
// Ensured clear error messages for invalid amounts, insufficient balances, and disconnected wallets.
// Improved Readability:
// Added id attributes for better form accessibility.
// Success/Error Message Consistency:
// Displayed messages consistently using errorMessage and successMessage.