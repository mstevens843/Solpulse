/**
 * MessageButton Component
 *
 * - Allows users to send direct messages to other users.
 * - Includes an optional crypto tip field (commented out for now).
 * - Uses a modal to display the message input form.
 * - Shows success or error messages after sending.
 */
import React, { useState } from "react";
import PropTypes from "prop-types";
import { api } from "@/api/apiConfig";
import Loader from "@/components/Loader";
import { useEffect } from "react";
import "@/css/components/Notification_components/MessageButton.css";
import { FaEnvelope } from "react-icons/fa";

const MessageButton = ({ recipientUsername }) => {
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [messageContent, setMessageContent] = useState(""); 
    const [cryptoTip, setCryptoTip] = useState(""); 
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [recipient, setRecipient] = useState(null);
    const [requestStatus, setRequestStatus] = useState(null); // 'pending', 'accepted', null



    /**
     * Toggles the message modal.
     * - Resets error and success messages on open/close.
     */
    const toggleModal = () => {
        setIsMessageModalOpen((prev) => !prev);
        setErrorMessage(""); // Clear any previous error
        setSuccessMessage(""); // Clear success message
    };



     // Sends a direct message request to the recipient.
    const handleSendRequest = async () => {
        try {
            const res = await api.post(`/message-requests/${recipient.id}`, {
                message: messageContent.trim(),
            });
            setRequestStatus("pending");
            setSuccessMessage("Request sent!");
        } catch (err) {
            console.error("Failed to send message request:", err);
            setErrorMessage("Failed to send request.");
        }
    };


    /**
     * Sends a direct message to the recipient.
     * - Prevents empty messages from being sent.
     * - Sends an optional crypto tip (currently disabled in UI).
     */
    const handleSendMessage = async () => {
        if (loading) return;

        if (!messageContent.trim()) {
            setErrorMessage("Message content cannot be empty.");
            return;
        }

        setLoading(true);
        try {
            const response = await api.post("/messages", {
                recipient: recipientUsername,
                message: messageContent.trim(),
                cryptoTip: cryptoTip ? parseFloat(cryptoTip) : 0.0, // Send crypto tip or default to 0.0
            });

            setSuccessMessage("Message sent successfully!");
            setMessageContent(""); // Clear input fields
            setCryptoTip("");
        } catch (error) {
            console.error("Error sending message:", error);
            setErrorMessage("Failed to send message. Please try again.");
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        const fetchRecipientData = async () => {
            try {
                const res = await api.get(`/users/profile/${recipientUsername}`);
                setRecipient(res.data.user);

                if (res.data.user.privacy === 'private') {
                    const check = await api.get(`/message-requests/${res.data.user.id}/has-requested`);
                    setRequestStatus(check.data.hasRequested ? 'pending' : null);
                }
            } catch (err) {
                console.error('Error fetching recipient info:', err);
            }
        };

        fetchRecipientData();
    }, [recipientUsername]);





    return (
        <div className="message-button-container">
            {/* Conditional button based on user privacy + request status */}
            {recipient?.privacy === 'private' ? (
                requestStatus === 'pending' ? (
                    <button className="message-btn disabled" disabled>
                        Request Pending
                    </button>
                ) : (
                    <button className="message-btn" onClick={handleSendRequest}>
                        <FaEnvelope /> Send Request
                    </button>
                )
            ) : (
                <button className="message-btn" onClick={toggleModal}>
                    <FaEnvelope /> Message
                </button>
            )}

            {/* Modal for composing the message */}
            {isMessageModalOpen && (
                <div className="modal-overlay" onClick={toggleModal}>
                    <div
                        className="modal-content message-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="close-btn" onClick={toggleModal}>
                            X
                        </button>
                        <h3>Send a Message to {recipientUsername}</h3>

                        <textarea
                            placeholder="Write your message..."
                            className="message-input"
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            rows="4"
                        />

                        {/* <input
                            type="number"
                            placeholder="Crypto Tip (optional)"
                            className="crypto-tip-input"
                            value={cryptoTip}
                            onChange={(e) => setCryptoTip(e.target.value)}
                        /> */}

                        <button
                            className="send-message-btn"
                            onClick={handleSendMessage}
                            disabled={loading}
                        >
                            {loading ? <Loader /> : "Send"}
                        </button>

                        {errorMessage && (
                            <p className="error-message">{errorMessage}</p>
                        )}
                        {successMessage && (
                            <p className="success-message">{successMessage}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

MessageButton.propTypes = {
    recipientUsername: PropTypes.string.isRequired, // Recipient's username
};

export default MessageButton;


/**
 * 🔹 **Potential Improvements:**
 * 1. **WebSocket Integration**: - SKIPPED
 *    - Use WebSockets for real-time messaging instead of relying solely on API requests.
 *
 * 2. **Enhanced Error Handling**:
 *    - Display backend validation errors more clearly.
 *    - Retry failed message sends instead of showing an error.
 *
 * 3. **Improve Crypto Tip Feature**:
 *    - Allow users to send tips with Solana transactions.
 *    - Include a dropdown for selecting different cryptocurrencies.
 *
 * 4. **UI/UX Enhancements**: - SKIPPED
 *    - Add a character counter for message input.
 *    - Animate modal opening and closing for a smoother experience.
 */