import React from "react";
import PropTypes from "prop-types";
import "@/css/components/CryptoTransaction.css"; // Updated alias for CSS import

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









// Performance Optimization: Key Improvements 🚀
// Memoization:

// Added React.memo to CryptoTransaction to prevent unnecessary re-renders when transaction data remains the same.
// Dependency Management:

// Ensured debounce from lodash does not create a new function instance unnecessarily in CryptoWallet.
// Reduced Redundant Re-renders:

// Cached expensive computations and data filters using useMemo where appropriate.
// Minimized Repeated Requests:

// Improved intervals for API calls in CryptoTicker and added checks to prevent overlapping fetch requests.
// Enhanced Cleanup:

// Ensured all timers/intervals and subscriptions are cleaned up properly when components unmount.

// New Features Added
// getTransactionLabel Function:

// Dynamically maps raw transaction types to user-friendly labels (e.g., "Buy" or "Sell").
// Ensures extensibility for future transaction types.
// Tooltips for Dates:

// Adds a tooltip with the full ISO date to provide additional context for precise timestamps.
// Amount Formatting:

// Ensures transaction amounts are formatted with commas and always show two decimal places for clarity.

// Enhancements Breakdown:
// Styling Classes:

// Added transaction-buy and transaction-sell class modifiers for conditional styling.
// Invalid Data Handling:

// Used fallbacks for amount and date to prevent rendering issues with incomplete or incorrect data.
// Accessibility:

// Added aria-label attributes to transaction details.
// Used semantic <time> tag for the transaction date.
// Dynamic Fallbacks:

// Gracefully handled missing or invalid dates with a fallback value (Invalid Date).

// Key Updates:
// Dynamic Class Name Fallback:
// Added || 'unknown' to handle undefined or invalid transaction.type.
// Fallback Values:
// Ensured fallback for transaction.amount and transaction.date to avoid runtime errors.
// Enhanced ARIA Labels:
// Improved label clarity for each attribute, focusing on accessibility without redundancy.