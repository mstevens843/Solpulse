/**
 * MessageButton Component
 *
 * - Allows users to send direct messages to other users.
 * - Includes an optional crypto tip field (commented out for now).
 * - Uses a modal to display the message input form.
 * - Shows success or error messages after sending.
 */
import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { api } from "@/api/apiConfig";
import Loader from "@/components/Loader";
import { FaEnvelope } from "react-icons/fa";
import { toast } from "react-toastify"; // <-- import the toast
import "@/css/components/Notification_components/MessageButton.css";

const MessageButton = ({ recipientUsername }) => {
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [cryptoTip, setCryptoTip] = useState("");
  const [loading, setLoading] = useState(false);

  // This local errorMessage / successMessage could be removed if we rely on toasts
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [recipient, setRecipient] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null); // 'pending' or null
  const [isFollowing, setIsFollowing] = useState(false);


  // For the little dropdown on "Request Pending"
  const [showRequestDropdown, setShowRequestDropdown] = useState(false);
  const dropdownRef = useRef(null);



   // Close dropdown if click outside
   useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowRequestDropdown(false);
      }
    }
    if (showRequestDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showRequestDropdown]);


  /**
   * Toggle the message modal
   */
  const toggleModal = () => {
    setIsMessageModalOpen((prev) => !prev);
    setErrorMessage("");
    setSuccessMessage("");
    setMessageContent("");
    setCryptoTip("");
  };

  /**
   * Send a message request to a private user you don't follow.
   */
  const handleSendRequest = async () => {
    if (!messageContent.trim()) {
      toast.error("Message content cannot be empty.");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/message-requests/${recipient.id}`, {
        message: messageContent.trim(),
      });

      // If success:
      setRequestStatus("pending");
      toast.success("Message Request Sent!");
      // Clear inputs & close the modal
      setMessageContent("");
      setCryptoTip("");
      setIsMessageModalOpen(false);
    } catch (err) {
      console.error("Failed to send message request:", err);
      toast.error("Failed to send message request.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send a normal direct message (public user or private+following).
   */
  const handleSendMessage = async () => {
    if (loading) return;
    if (!messageContent.trim()) {
      toast.error("Message cannot be empty.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/messages", {
        recipient: recipientUsername,
        message: messageContent.trim(),
        cryptoTip: cryptoTip ? parseFloat(cryptoTip) : 0.0,
      });

      toast.success("Message sent successfully!");
      // Clear inputs & close the modal
      setMessageContent("");
      setCryptoTip("");
      setIsMessageModalOpen(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  /**
   * Cancel a pending message request
   */
  const handleCancelMessageRequest = async () => {
    if (!recipient?.id) return;
    try {
      await api.delete(`/message-requests/${recipient.id}/cancel`);
      toast.info("Message request canceled.");
      setRequestStatus(null);
    } catch (err) {
      console.error("Failed to cancel message request:", err);
      toast.error("Failed to cancel.");
    }
    setShowRequestDropdown(false);
  };

  /**
   * On mount or when `recipientUsername` changes, fetch user profile + isFollowing + request status
   */
  useEffect(() => {
    const fetchRecipientData = async () => {
      try {
        // Use your new /profile-auth route to get isFollowing
        const res = await api.get(`/users/profile-auth/${recipientUsername}`);
        setRecipient(res.data.user);
        setIsFollowing(res.data.isFollowing);

        // If user is private, see if we have a pending request
        if (res.data.user.privacy === "private") {
          const check = await api.get(`/message-requests/${res.data.user.id}/has-requested`);
          setRequestStatus(check.data.hasRequested ? "pending" : null);
        } else {
          // If they're not private, no need for request status
          setRequestStatus(null);
        }
      } catch (err) {
        console.error("Error fetching recipient info:", err);
      }
    };

    fetchRecipientData();
  }, [recipientUsername]);


  /**
   * Decide which button to show
   */
  const renderButton = () => {
    // Private user
    if (recipient?.privacy === "private") {
      // Already following => normal "Message"
      if (isFollowing) {
        return (
          <button className="message-btn" onClick={toggleModal}>
            <FaEnvelope /> Message
          </button>
        );
      }
      // Not following => check requestStatus
      if (requestStatus === "pending") {
        // Show "Request Pending ▼" with a dropdown
        return (
          <div className="pending-request-container" ref={dropdownRef}>
            <button
              className="message-btn"
              onClick={() => setShowRequestDropdown((prev) => !prev)}
              disabled={loading}
            >
              Request Pending <span className="dropdown-arrow">▼</span>
            </button>
            {showRequestDropdown && (
              <div className="request-dropdown">
                <button onClick={handleCancelMessageRequest}>Cancel Request</button>
              </div>
            )}
          </div>
        );
      }
      // No pending => "Send Request"
      return (
        <button className="message-btn" onClick={toggleModal}>
          <FaEnvelope /> Send Request
        </button>
      );
    }

        // Public user => always "Message"
        return (
        <button className="message-btn" onClick={toggleModal}>
            <FaEnvelope /> Message
        </button>
        );
    };




    return (
        <div className="message-button-container">
          {renderButton()}
    
          {isMessageModalOpen && (
            <div className="modal-overlay" onClick={toggleModal}>
              <div className="modal-content message-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={toggleModal}>
                  X
                </button>
                <h3>
                  {recipient?.privacy === "private" && !isFollowing
                    ? `Send a Message Request to ${recipientUsername}`
                    : `Send a Message to ${recipientUsername}`}
                </h3>
    
                <textarea
                  placeholder="Write your message..."
                  className="message-input"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                />
    
                <button
                  className="send-message-btn"
                  onClick={
                    recipient?.privacy === "private" && !isFollowing
                      ? handleSendRequest
                      : handleSendMessage
                  }
                  disabled={loading}
                >
                  {loading ? (
                    <Loader />
                  ) : recipient?.privacy === "private" && !isFollowing ? (
                    "Send Request"
                  ) : (
                    "Send"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      );
    };

MessageButton.propTypes = {
  recipientUsername: PropTypes.string.isRequired,
};

export default MessageButton;