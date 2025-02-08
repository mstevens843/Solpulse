import React from "react";
import PropTypes from "prop-types";
import "@/css/components/Crypto_components/CryptoTransaction.css";
const CryptoTransaction = React.memo(({ transaction }) => {
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

    return (
        <li
            className={`crypto-transaction-item transaction-${transaction?.type?.toLowerCase() || "unknown"}`}
            aria-label={`Transaction: ${transactionType}, Amount: ${transactionAmount} SOL, Date: ${transactionDate}`}
        >
            <p className="crypto-transaction-type">
                <strong>Type:</strong> {transactionType}
            </p>
            <p className="crypto-transaction-amount">
                <strong>Amount:</strong> {transactionAmount} SOL
            </p>
            <p className="crypto-transaction-date">
                <strong>Date:</strong>{" "}
                <time dateTime={transaction?.date || ""}>{transactionDate}</time>
            </p>
        </li>
    );
});

CryptoTransaction.propTypes = {
    transaction: PropTypes.shape({
        type: PropTypes.string, // e.g., "buy", "sell", "sent", etc.
        amount: PropTypes.number, // Transaction amount in SOL
        date: PropTypes.string, // ISO date string
    }),
};

CryptoTransaction.defaultProps = {
    transaction: {
        type: "Unknown",
        amount: 0,
        date: "Invalid Date",
    },
};

export default CryptoTransaction;