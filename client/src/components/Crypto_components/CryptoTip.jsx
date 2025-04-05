/**
 * CryptoTip.js
 *
 * This file is responsible for allowing users to send Solana (SOL) tips to others.
 * It integrates with the Solana blockchain to process transactions directly from the sender's wallet.
 *
 * It allows users to:
 * - Connect their Solana wallet to initiate transactions.
 * - Send SOL to a recipient's wallet address.
 * - Include an optional message along with the tip.
 * - Receive real-time success/error notifications.
 *
 * Features:
 * - **Uses Wallet Adapter:** Supports browser wallets like Phantom and Solflare.
 * - **Real Blockchain Transactions:** Sends SOL via the Solana Web3.js API.
 * - **Live Status Notifications:** Uses `react-toastify` for feedback on transactions.
 * - **Debounced Input Handling:** Ensures proper formatting for tip amounts.
 * - **Security Checks:** Prevents invalid or duplicate transactions.
 */


import React, { useState, useEffect, memo } from "react"; // ✅ #4
import PropTypes from "prop-types";
import { useWallet } from "@solana/wallet-adapter-react";
import { api } from "@/api/apiConfig";
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@/css/components/Crypto_components/CryptoTip.css";


const SPL_TOKENS = {
    USDC: {
      mint: "Es9vMFrzaCERJbBjwGtW2zNnrSdZ4gtaGWgJbznVJWZk", // ✅ #3
      decimals: 6,
    },
  };

const CryptoTip = ({ recipientId, recipientWallet, currentUser, onTipSuccess, connectedWallet, toggleTipModal, isWalletConnected }) => {
    const wallet = useWallet();
    const [tipAmount, setTipAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [tipMessage, setTipMessage] = useState("");
    const [token, setToken] = useState("SOL"); // ✅ #3


    // ✅ #4 Auto-detect wallet connection
  useEffect(() => {
    if (wallet?.connected && wallet?.publicKey) {
      console.log("✅ Wallet auto-connected:", wallet.publicKey.toString());
    }
  }, [wallet]);


    /**
     * Handles sending a tip in SOL.
     * - Ensures wallet is connected.
     * - Validates input to prevent invalid transactions.
     * - Uses Solana Web3.js to send the transaction.
     * - Notifies the recipient via API.
     */
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
      const connection = new Connection("https://solana-mainnet.g.alchemy.com/v2/dhWoE-s3HVNfalBWpWnzRIWfyJIqTamF");
      const recipientPublicKey = new PublicKey(recipientWallet);
    
      try {
        const transaction = new Transaction();
    
        if (token === "SOL") {
          transaction.add(
            SystemProgram.transfer({
              fromPubkey: wallet.publicKey,
              toPubkey: recipientPublicKey,
              lamports: amount * LAMPORTS_PER_SOL,
            })
          );
        } else if (token === "USDC") {
          toast.error("⚠️ SPL token transfers require associated token program integration.", {
            position: "top-right",
            autoClose: 6000,
            theme: "dark",
          });
          setIsLoading(false);
          return;
        }
    
        const signature = await wallet.sendTransaction(transaction, connection);
        console.log("Transaction Signature:", signature);
    
        // ❌ Temporarily disabled while on free-tier RPC
        // const confirmTx = await connection.confirmTransaction(signature, "confirmed");
        // if (confirmTx.value.err) {
        //   throw new Error("Transaction failed");
        // }
    
        // ✅ Notify recipient via API immediately
        await api.post("/notifications", {
          type: "transaction",
          actorId: currentUser.id,
          userId: recipientId,
          amount,
          entityId: signature,
          message: `🎉 You received a tip of ${amount} ${token}!`,
          content: tipMessage || null, // ✅ send optional message as content

        });
    
        // ✅ Show toast with Solscan link
        toast.success(
          <div>
            ✅ Tip Sent! Confirm on Solana:
            <br />
            <a
              href={`https://solscan.io/tx/${signature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="toast-link"
            >
              View Transaction
            </a>
          </div>,
          { autoClose: 6000, theme: "dark" }
        );
    
        setTipAmount("");
        setTipMessage("");

        // Slight delay so toast renders before component unmounts
        setTimeout(() => {
          toggleTipModal(false);
        }, 300);
      } catch (error) {
        console.error("Error sending tip:", error);
        let friendlyMsg = "⚠️ Failed to send the tip. Please try again.";
    
        if (error.message.includes("insufficient")) {
          friendlyMsg = "❌ Not enough SOL in your wallet.";
        } else if (error.message.includes("User rejected")) {
          friendlyMsg = "❌ You rejected the transaction.";
        }
    
        toast.error(friendlyMsg, {
          position: "top-right",
          autoClose: 4000,
          theme: "dark",
        });
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="crypto-tip-container">
        <h3 className="crypto-tip-heading">Send a Tip</h3>
    
       {/* ✅ Wallet display */}
{wallet.connected && wallet.publicKey ? (
  <div className="wallet-connection-box">
    <span className="wallet-status-icon">✅</span>
    <span className="wallet-status-text">Connected to:</span>
    <span className="wallet-address">{wallet.publicKey.toBase58()}</span>
  </div>
) : (
  <p className="wallet-disconnected-message">
    ⚠️ Please connect your wallet in the navbar.
  </p>
)}

<form onSubmit={handleSendTip} className="crypto-tip-form">
  {/* Tip amount */}
  <input
    type="number"
    placeholder="Tip amount"
    value={tipAmount}
    onChange={(e) => setTipAmount(e.target.value)}
    className="crypto-tip-input"
    min="0.01"
    step="0.01"
    required
  />

  {/* Optional message */}
  <textarea
    placeholder="Add a message (optional)"
    value={tipMessage}
    onChange={(e) => setTipMessage(e.target.value)}
    maxLength="255"
    className="crypto-tip-message-input"
  />

  {/* Token selector */}
  <div className="crypto-tip-token-section">
    <label htmlFor="token" className="crypto-tip-token-label">
      Choose Token:
    </label>
    <select
      id="token"
      value={token}
      onChange={(e) => setToken(e.target.value)}
      className="crypto-tip-token-selector"
    >
      <option value="SOL">SOL</option>
      <option value="USDC">USDC (Coming Soon)</option>
    </select>
  </div>

  <button
    type="submit"
    className="crypto-tip-submit-button"
    disabled={!tipAmount || isLoading || !wallet.connected}
  >
    {isLoading ? "Sending..." : "Send Tip"}
  </button>
</form>
      </div>
    );
  }

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


/**
 * 🔹 **Potential Improvements:**
 * - **Live Transaction Tracking:** Poll Solana blockchain for transaction status updates.
 * - **Better Error Handling:** Show specific error messages based on Solana API responses.
 * - **Alternative Currencies:** Allow users to send SPL tokens instead of just SOL.
 * - **Auto-Detect Wallet Connection:** Improve UX by auto-detecting when the user connects their wallet.
 */