import React, { useState } from "react";
import PropTypes from "prop-types";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import "@/css/components/Crypto_components/CryptoTip.css";

const CryptoTip = ({ recipientId, recipientWallet, onTipSuccess, connectedWallet, isWalletConnected }) => {
    const wallet = useWallet();
    const [tipAmount, setTipAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [tipMessage, setTipMessage] = useState("");

    const handleSendTip = async (e) => {
        e.preventDefault();

        if (!wallet.connected || !wallet.publicKey) {
            setMessage("⚠️ Please connect your wallet first.");
            return;
        }

        const amount = parseFloat(tipAmount);
        if (amount <= 0 || isNaN(amount)) {
            setMessage("⚠️ Please enter a valid tip amount.");
            return;
        }

        setIsLoading(true);
        setMessage("");

        try {
            const connection = new Connection("https://solana-mainnet.g.alchemy.com/v2/dhWoE-s3HVNfalBWpWnzRIWfyJIqTamF");
            const recipientPublicKey = new PublicKey(recipientWallet);

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: wallet.publicKey,
                    toPubkey: recipientPublicKey,
                    lamports: amount * 1e9, // Convert SOL to lamports
                })
            );

            const signature = await wallet.sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, "processed");

            onTipSuccess(`🎉 Successfully sent ${amount} SOL to ${recipientWallet}!`);
            setMessage(`🎉 Successfully sent ${amount} SOL!`);
            setTipAmount("");
            setTipMessage("");
        } catch (error) {
            console.error("Error sending tip:", error);
            setMessage("⚠️ Failed to send the tip. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
            <div className="crypto-tip-container">
            <h3 className="crypto-tip-heading">Send a Tip</h3>

            {/* ✅ Wallet Connection Message */}
            {isWalletConnected ? (
                <p className="wallet-connected-message">✅ Connected to: {connectedWallet}</p>
            ) : (
                <p className="wallet-disconnected-message">⚠️ Please connect your wallet in the navbar.</p>
            )}

            <form onSubmit={handleSendTip} className="crypto-tip-form">
                <input
                    type="number"
                    placeholder="Tip amount (SOL)"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    className="crypto-tip-input"
                    min="0.01"
                    step="0.01"
                    required
                />
                <textarea
                    placeholder="Add a message (optional)"
                    value={tipMessage}
                    onChange={(e) => setTipMessage(e.target.value)}
                    maxLength="255"
                    className="crypto-tip-message-input"
                />
                <button type="submit" className="crypto-tip-submit-button" disabled={!tipAmount || isLoading || !isWalletConnected}>
                    {isLoading ? "Sending..." : "Send Tip"}
                </button>
            </form>
            {message && <p className={message.includes("🎉") ? "success-message" : "error-message"}>{message}</p>}
        </div>
    );
};

CryptoTip.propTypes = {
    recipientId: PropTypes.number.isRequired,
    recipientWallet: PropTypes.string.isRequired,
    connectedWallet: PropTypes.string, // ✅ Show connected wallet
    isWalletConnected: PropTypes.bool, // ✅ Ensure wallet connection is passed
    onTipSuccess: PropTypes.func.isRequired,
};

export default CryptoTip;






// 5. CryptoTip
// Reason:

// Minimal state updates, but interactions can still trigger unnecessary re-renders.
// Updates Needed:

// Use React.memo to ensure it re-renders only when props (onTip) change.
// Validate inputs early to avoid unnecessary onTip calls.

// Enhancements and Features
// Functional Improvements
// Validation for Tip Amount:

// Ensure the tip amount is a valid number and prevent invalid submissions (e.g., non-numeric inputs or negative values).
// Add user-friendly error feedback for invalid inputs.
// Feedback After Submission:

// Provide confirmation (e.g., "Tip sent!") after a successful tip submission.
// Loading State:

// Add a loading state when the tip is being processed.

// New Features
// Preset Tip Amounts:

// Add buttons for preset tip amounts (e.g., 0.1 SOL, 0.5 SOL, 1 SOL) to allow quick selection.
// Success/Error Messages:

// Display a success message on a successful tip submission or an error message on failure.

// Key Updates:
// recipientId Prop:

// Added recipientId as a required prop to ensure the backend knows the recipient of the tip.
// Optional Message:

// Introduced a textarea field to allow users to include an optional message when sending a tip (aligned with the backend).
// onTip Callback:

// The onTip callback now expects an object containing toUserId, amount, and an optional message.
// UI Improvements:

// Added a character limit (255) for the optional message to ensure it aligns with backend constraints.


// Summary of Changes:
// Validation Improvement:
// Added check for valid, positive numeric values in the tip amount.
// Enhanced Accessibility:
// Included aria-label attributes for better screen reader support.
// Feedback Enhancements:
// Differentiated success and error messages visually with class names.
// Optimization:
// Avoided redundant state updates by ensuring tipAmount changes only when necessary.

// Key Features:
// Dynamic Feedback:
// Success messages include emojis (🎉) and green styling, while errors are styled with warnings.
// Accessibility:
// Added aria-label attributes and id properties for form elements to improve accessibility.
// Consistent Validation:
// Ensures that only valid positive numbers can be submitted.