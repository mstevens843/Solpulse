import React, { useState } from "react";
import PropTypes from "prop-types";
import { api } from "@/api/apiConfig"; // Centralized API config
import Loader from "@/components/Loader"; // Reuse loader if needed
import "@/css/components/Notification_components/MessageButton.css"; // Style for message button/modal
import { FaEnvelope } from "react-icons/fa";

const MessageButton = ({ recipientUsername }) => {
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false); // Modal visibility
    const [messageContent, setMessageContent] = useState(""); // Message content
    const [cryptoTip, setCryptoTip] = useState(""); // Optional crypto tip
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const toggleModal = () => {
        setIsMessageModalOpen((prev) => !prev);
        setErrorMessage(""); // Clear any previous error
        setSuccessMessage(""); // Clear success message
    };

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

    return (
        <div className="message-button-container">
            {/* Button to open the message modal */}
            <button
                className="message-btn"
                onClick={toggleModal}
                aria-label="Send Message"
            >
                <FaEnvelope /> Message
            </button>

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

                        <input
                            type="number"
                            placeholder="Crypto Tip (optional)"
                            className="crypto-tip-input"
                            value={cryptoTip}
                            onChange={(e) => setCryptoTip(e.target.value)}
                        />

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
