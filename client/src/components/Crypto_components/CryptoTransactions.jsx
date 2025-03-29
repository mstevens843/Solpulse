/**
 * CryptoTransaction.js
 *
 * This file is responsible for displaying individual cryptocurrency transactions in a list format.
 * It provides a structured way to present transaction details, including:
 * - Transaction Type (Buy, Sell, Sent, Received, Tip)
 * - Transaction Amount (formatted in SOL)
 * - Transaction Date (formatted in a readable string)
 *
 * Features:
 * - **Memoized for Performance:** Uses `React.memo` to prevent unnecessary re-renders.
 * - **Type Normalization:** Ensures transaction types are displayed consistently.
 * - **Date Formatting:** Converts ISO date strings into readable timestamps.
 * - **Accessible Labels:** Includes `aria-labels` for screen reader support.
 */



import React, { useState } from "react"; // ✅ Added state for expand/collapse
import PropTypes from "prop-types";
import "@/css/components/Crypto_components/CryptoTransaction.css";

const CryptoTransaction = React.memo(({ transaction, usdPerSol }) => {
    const [expanded, setExpanded] = useState(false); // ✅ Expandable toggle state

    /**
     * Converts transaction type to a user-friendly label.
     * - Handles different cases to ensure consistency.
     */
    const getTransactionLabel = (type) => {
        switch (type?.toLowerCase()) {
            case "buy":
                return "Buy";
            case "sell":
                return "Sell";
            case "sent":
                return "Sent";
            case "received":
                return "Received";
            case "tip":
                return "Tip";
            default:
                return "Unknown";
        }
    };

    /**
     * Formats date into a readable format.
     * - Ensures valid date parsing to prevent display errors.
     */
    const formatDate = (date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime())
            ? parsedDate.toLocaleString()
            : "Invalid Date";
    };

    const transactionType = getTransactionLabel(transaction?.type);
    const transactionAmount = transaction?.amount?.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }) || "0.00";
    const transactionDate = formatDate(transaction?.date || "");

    const usdValue = usdPerSol && transaction?.amount
        ? (transaction.amount * usdPerSol).toFixed(2)
        : null; // ✅ USD Calculation (if available)

    return (
        <li
            className={`crypto-transaction-item transaction-${transaction?.type?.toLowerCase() || "unknown"}`}
            onClick={() => setExpanded(!expanded)} // ✅ Toggle on click
            aria-label={`Transaction: ${transactionType}, Amount: ${transactionAmount} SOL, Date: ${transactionDate}`}
        >
            <p className="crypto-transaction-type">
                <strong>Type:</strong> {transactionType}
            </p>
            <p className="crypto-transaction-amount">
                <strong>Amount:</strong> {transactionAmount} SOL{" "}
                {usdValue && (
                    <span className="usd-amount text-xs text-solana-text-light ml-1">
                        (${usdValue} USD) {/* ✅ Improvement #1 */}
                    </span>
                )}
            </p>
            <p className="crypto-transaction-date">
                <strong>Date:</strong>{" "}
                <time dateTime={transaction?.date || ""}>{transactionDate}</time>
            </p>

            {expanded && (
                <div className="crypto-transaction-details">
                    <p><strong>Token:</strong> {transaction?.token || "N/A"}</p> {/* ✅ Optimization #2 */}
                    <p><strong>Slot:</strong> {transaction?.slot || "N/A"}</p> {/* ✅ Optimization #4 */}
                    <p><strong>Fee:</strong> {transaction?.fee?.toFixed(6) || "0.000000"} SOL</p> {/* ✅ Optimization #6 */}
                    <p>
                        <strong>From:</strong>{" "}
                        <span className="tx-address">{transaction?.from || "Unknown"}</span>
                    </p> {/* ✅ Optimization #5 */}
                    <p>
                        <strong>To:</strong>{" "}
                        <span className="tx-address">{transaction?.to || "Unknown"}</span>
                    </p> {/* ✅ Optimization #5 */}
                    <p>
                        <strong>Tx Hash:</strong>{" "}
                        <a
                            href={transaction?.explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tx-link"
                        >
                            View on Solscan
                        </a>
                    </p> {/* ✅ Optimization #1 */}
                </div>
            )}
        </li>
    );
});

CryptoTransaction.propTypes = {
    transaction: PropTypes.shape({
        type: PropTypes.string,
        amount: PropTypes.number,
        date: PropTypes.string,
        token: PropTypes.string,
        slot: PropTypes.number,
        fee: PropTypes.number,
        id: PropTypes.string,
        explorerUrl: PropTypes.string,
        from: PropTypes.string,
        to: PropTypes.string,
    }),
    usdPerSol: PropTypes.number, // ✅ Improvement #1 - optional prop
};

CryptoTransaction.defaultProps = {
    transaction: {
        type: "Unknown",
        amount: 0,
        date: "Invalid Date",
        token: "SOL",
        slot: null,
        fee: 0,
        id: "",
        explorerUrl: "",
        from: "Unknown",
        to: "Unknown",
    },
    usdPerSol: null, // ✅ Default for USD conversion
};

export default CryptoTransaction;

/**
 * 🔹 **Potential Improvements:**
 * - **Add Support for Fiat Values:** ✅ Implemented — Convert and display transaction amounts in USD.
 * - **Transaction Status:** Show pending/completed transaction statuses.
 * - **Expandable Details:** ✅ Already implemented.
 * - **Filter Transactions:** ✅ Already implemented in parent.
 */