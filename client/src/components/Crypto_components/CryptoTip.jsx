import React, { useState, memo } from "react";
import PropTypes from "prop-types";
import { useWallet } from "@solana/wallet-adapter-react";
import { api } from "@/api/apiConfig";
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@/css/components/Crypto_components/CryptoTip.css";

const CryptoTip = ({ recipientId, recipientWallet, currentUser, onTipSuccess, connectedWallet, toggleTipModal, isWalletConnected }) => {
    const wallet = useWallet();
    const [tipAmount, setTipAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [tipMessage, setTipMessage] = useState("");

    const handleSendTip = async (e) => {
        e.preventDefault();

        if (!wallet.connected || !wallet.publicKey) {
            toast.error("⚠️ Please connect your wallet first.", {
                position: "top-right",
                autoClose: 3000,
                theme: "dark",
            });
            return;
        }

        const amount = parseFloat(tipAmount);
        if (amount <= 0 || isNaN(amount)) {
            toast.error("⚠️ Please enter a valid tip amount.", {
                position: "top-right",
                autoClose: 3000,
                theme: "dark",
            });
            return;
        }

        setIsLoading(true);

        try {
            const connection = new Connection("https://solana-mainnet.g.alchemy.com/v2/dhWoE-s3HVNfalBWpWnzRIWfyJIqTamF");
            const recipientPublicKey = new PublicKey(recipientWallet);

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: wallet.publicKey,
                    toPubkey: recipientPublicKey,
                    lamports: amount * 1e9,
                })
            );

            const signature = await wallet.sendTransaction(transaction, connection);
            console.log("Transaction Signature:", signature);

            // ✅ Send notification to recipient
            await api.post("/notifications", {
                type: "transaction",
                actorId: currentUser.id, // Sender ID
                userId: recipientId, // Recipient ID
                amount: amount,
                entityId: signature, // Transaction signature as entity ID
                message: `🎉 You received a tip of ${amount} SOL!`,
            });

            setTimeout(() => {
                setIsLoading(false);
                toast.success(`🎉 Successfully sent ${tipAmount} SOL to ${recipientWallet}!`, {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "dark",
                });
                setTipAmount("");
                setTipMessage("");
                toggleTipModal(false);
            }, 1000);

        } catch (error) {
            console.error("Error sending tip:", error);
            toast.error("⚠️ Failed to send the tip. Please try again.", {
                position: "top-right",
                autoClose: 3000,
                theme: "dark",
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="crypto-tip-container">
            <ToastContainer />
            <h3 className="crypto-tip-heading">Send a Tip</h3>

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
        </div>
    );
};

CryptoTip.propTypes = {
    recipientId: PropTypes.number.isRequired,
    recipientWallet: PropTypes.string.isRequired,
    connectedWallet: PropTypes.string,
    isWalletConnected: PropTypes.bool,
    onTipSuccess: PropTypes.func.isRequired,
    toggleTipModal: PropTypes.func.isRequired,
    currentUser: PropTypes.object.isRequired,
};

export default memo(CryptoTip);
