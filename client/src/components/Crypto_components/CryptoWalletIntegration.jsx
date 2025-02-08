import React, { useState, useEffect, useMemo } from "react";
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import "@/css/components/Crypto_components/CryptoWalletIntegration.css";

function CryptoWalletIntegration() {
    const [balance, setBalance] = useState(null);
    const [recipient, setRecipient] = useState("");
    const [sendAmount, setSendAmount] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const wallet = useWallet();
    const connection = useMemo(() => new Connection("https://solana-mainnet.g.alchemy.com/v2/dhWoE-s3HVNfalBWpWnzRIWfyJIqTamF"), []);

    useEffect(() => {
        if (wallet.connected && wallet.publicKey) {
            fetchWalletBalance(wallet.publicKey);
        }
    }, [wallet.connected, wallet.publicKey]);

    const fetchWalletBalance = async (publicKey) => {
        try {
            const lamports = await connection.getBalance(publicKey);
            setBalance(lamports / 1e9);
        } catch (error) {
            console.error("Error fetching balance:", error);
            setErrorMessage("Failed to fetch wallet balance.");
        }
    };

    const handleSendTransaction = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        try {
            if (!wallet.connected || !wallet.publicKey) {
                throw new Error("Please connect your wallet first.");
            }

            let recipientPublicKey;
            try {
                recipientPublicKey = new PublicKey(recipient.trim());
            } catch {
                throw new Error("Invalid recipient address.");
            }

            const amount = parseFloat(sendAmount);
            if (isNaN(amount) || amount <= 0) {
                throw new Error("Enter a valid amount greater than 0.");
            }
            if (amount > balance) {
                throw new Error("Insufficient balance.");
            }

            setIsProcessing(true);

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: wallet.publicKey,
                    toPubkey: recipientPublicKey,
                    lamports: amount * 1e9,
                })
            );

            const signature = await wallet.sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, "processed");

            const explorerLink = `https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta`;

            setSuccessMessage(`Transaction successful! View on Explorer: ${explorerLink}`);
            setRecipient("");
            setSendAmount("");
            fetchWalletBalance(wallet.publicKey);
        } catch (error) {
            console.error("Transaction failed:", error);
            setErrorMessage(error.message || "Transaction failed. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="crypto-wallet-integration">
            <WalletMultiButton />
            <p className="wallet-balance">
                Balance: {balance !== null ? `${balance.toFixed(2)} SOL` : "0 SOL"}
            </p>
            {errorMessage && (
                <p className="wallet-error" role="alert" aria-live="assertive">
                    {errorMessage}
                </p>
            )}
            {successMessage && (
                <p className="wallet-success" role="alert" aria-live="polite">
                    {successMessage}
                </p>
            )}
            <form onSubmit={handleSendTransaction} className="wallet-form">
                <input
                    type="text"
                    placeholder="Recipient Wallet Address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    aria-label="Enter recipient's wallet address"
                    className="wallet-input"
                    required
                    disabled={isProcessing}
                />
                <input
                    type="number"
                    placeholder="Amount (SOL)"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    aria-label="Enter amount to send"
                    className="wallet-input"
                    min="0.01"
                    step="0.01"
                    required
                    disabled={isProcessing}
                />
                <button
                    type="submit"
                    className="wallet-submit-button"
                    disabled={isProcessing}
                >
                    {isProcessing ? "Processing..." : "Send"}
                </button>
            </form>
        </div>
    );
}

export default CryptoWalletIntegration;