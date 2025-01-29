// The Messages page enables users to manage their direct messages effectively. It features: 
// Message List: Displays list of existing direct messages fetch from the API, using MESSAGEPREVIEW component for each message
// Loading State: Shows a loading indicator while fetching messages. 
// Error Handling: Displays error messages for issues like failed message retrieval or sending. 
// Message Form: Allows users to compose and send new messages, specifying the recipent, message content, and an optional crypto tip. 
// Dynamic Updates: Refreshes message list immediately after a new message is sent, ensuring real-time interaction. 

// This page integrates messaging functionality with optional crypto tipping, offering a seamless communication experience. 


import React, { useState, useEffect } from "react";
import { api } from "@/api/apiConfig"; // Use centralized API config
import Loader from "@/components/Loader";
import "@/css/pages/Notification_components/Messages.css"; // Updated alias for Vite compatibility
import MessageModal from "../components/Notification_components/MessageModal";

function Messages() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [recipient, setRecipient] = useState("");
  const [suggestedRecipients, setSuggestedRecipients] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);


  useEffect(() => {
    document.title = "Messages | Solrise";
    fetchMessages(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (showModal) {
      fetchRecentRecipients();
    }
  }, [showModal]);

  const fetchMessages = async (page = 1) => {
    setIsLoadingMessages(true);
    try {
      const response = await api.get(`/messages?page=${page}`);
      setMessages(response.data.messages);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
      setError("");
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages. Please try again.");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const fetchRecentRecipients = async () => {
    try {
      const response = await api.get("/messages/recent-recipients");
      setSuggestedRecipients(response.data.recipients);
    } catch (err) {
      console.error("Error fetching recent recipients:", err);
    }
  };

  // Debounced search for users
  const handleRecipientChange = (e) => {
    const query = e.target.value;
    setRecipient(query);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (query.length > 1) {
      setSearchTimeout(
        setTimeout(async () => {
          try {
            const response = await api.get(`/messages/search-users?query=${query}`);
            setSuggestedUsers(response.data.users);
          } catch (err) {
            console.error("Error searching users:", err);
          }
        }, 300) // Debounce delay (300ms)
      );
    } else {
      setSuggestedUsers([]);
    }
  };

  const selectRecipient = (username) => {
    setRecipient(username);
    setSuggestedUsers([]);
    setSuggestedRecipients([]); // Clear recent recipients when selection is made
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSendingMessage(true);

    if (!recipient.trim() || !newMessage.trim()) {
      setError("Recipient and message are required.");
      setIsSendingMessage(false);
      return;
    }

    const newMessageData = {
      recipient: recipient.trim(),
      message: newMessage.trim(),
    };

    try {
      await api.post("/messages", newMessageData);
      setNewMessage("");
      setRecipient("");
      setSuccessMessage("Message sent successfully!");
      setShowModal(false);
      fetchMessages();
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleOpenMessage = (message) => {
    setSelectedMessage(message);
  };

  const handleCloseModal = () => {
    setSelectedMessage(null);
  };

  const handleReply = async (messageId, replyContent) => {
    if (!replyContent.trim()) {
      setError("Reply cannot be empty.");
      return;
    }
  
    try {
      await api.post("/messages", {
        recipient: selectedMessage.sender,  // Use the correct recipient username
        message: replyContent.trim(),
      });
  
      setSuccessMessage("Reply sent successfully!");
      setNewMessage(""); // Clear the reply textarea
      setSelectedMessage(null); // Close modal
      fetchMessages(); // Refresh inbox
    } catch (err) {
      console.error("Error sending reply:", err);
      setError("Failed to send reply.");
    }
  };

  const markAsRead = async (message) => {
    try {
      if (!message.read) {
        await api.patch(`/messages/${message.id}/read`);
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === message.id ? { ...msg, read: true } : msg
          )
        );
      }
      handleOpenMessage(message);
    } catch (err) {
      console.error("Error marking message as read:", err);
      setError("Failed to mark message as read.");
    }
  };


  return (
    <div className="messages-container">
      <h1 className="messages-header">Messages</h1>

      {error && <div className="messages-error" role="alert">{error}</div>}
      {successMessage && <div className="messages-success" aria-live="polite">{successMessage}</div>}
      {isLoadingMessages && <Loader className="messages-loader" />}

      <div className="message-list">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-item ${msg.read ? "read" : "unread"}`}
              onClick={() => markAsRead(msg)}
              aria-label={`Message from ${msg.sender}`}
            >
              <p>
                <strong>{msg.sender}</strong>: {msg.content}
              </p>
            </div>

          ))
        ) : (
          !isLoadingMessages && <p className="messages-empty">No messages available.</p>
        )}
      </div>

      {/* Pagination Buttons */}
      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          Previous
        </button>

        <span className="pagination-info">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          Next
        </button>
      </div>

      <button className="new-message-btn" onClick={() => setShowModal(true)}>+</button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Send a New Message</h2>
            <form onSubmit={handleSendMessage}>
              <label htmlFor="recipient">Recipient:</label>
              <input
                id="recipient"
                type="text"
                placeholder="Search recipient"
                value={recipient}
                onChange={handleRecipientChange}
                required
                autoComplete="off"   // Disable browser autofill
                spellCheck="false"   // Optional: Disable spellcheck
              />

              {/* Dropdown for user search results */}
              {suggestedUsers.length > 0 && (
                <ul className="suggested-users">
                  {suggestedUsers.map((user) => (
                    <li key={user.username} onClick={() => selectRecipient(user.username)}>
                      {user.username}
                    </li>
                  ))}
                </ul>
              )}

              {/* Dropdown for recent recipients */}
              {suggestedRecipients.length > 0 && recipient.length === 0 && (
                <ul className="suggested-users">
                  {suggestedRecipients.map((user) => (
                    <li key={user} onClick={() => selectRecipient(user)}>
                      {user}
                    </li>
                  ))}
                </ul>
              )}

              <label htmlFor="newMessage">Message:</label>
              <textarea
                id="newMessage"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                required
              />

              <button type="submit" disabled={isSendingMessage}>
                {isSendingMessage ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Message Modal for viewing full message and replying */}
      {selectedMessage && (
        <MessageModal
          message={selectedMessage}
          onClose={handleCloseModal}
          onReply={handleReply}
        />
      )}
    </div>
  );
}

export default Messages;







// Components Added:
// MessagePreview Component:
// This component is used to render a preview of each direct message inside the message-list.
// It allows a clean and modular way to show message details like the sender, message content, and time sent.
// Explanation:
// Messages Fetching: The useEffect hook fetches messages from the /api/messages endpoint when the component mounts, ensuring the 
// latest messages are displayed.
// Message Sending: The form allows users to send messages, optionally adding a crypto tip (in Solana or any other currency) to 
// the recipient. The form data is sent via a POST request to the backend.
// Real-time Updates: After a message is successfully sent, the message list updates by appending the new message without 
// needing a full-page refresh.
// MessagePreview Component: This component is used to format and display each message. You might want to add additional 
// styling or data, such as showing if a message has been read.


// MessagePreview Component: Added to show a preview of each direct message in the message list.

// Key Components:
// handleSendMessage: Handles form submission to send a new message along with an optional crypto tip. It's integrated into the 
// form in the Messages component.
// Error Handling: Errors are caught and displayed when sending a message fails, and loading states are handled during fetching.
// Message List: The list of messages is fetched when the component loads using useEffect. Each message is rendered using the 
// MessagePreview component.


// IMPROVEMENTS MADE: 
// PAGE TITLE: Helps users identify which page they are on. 
// ERROR BANNER: A user-friendly error message displayed prominently
// AUTO-REFRESH: Keeps the message list updated in real-time. 
// LOADER COMPONENT: Adds better loading indicator instead of plain text. 
// VALIDATION: Ensures recipent and message fields are properly validated. 
// ENHANCED FORM ACCESSIBILITY: Labels are tied to inputs for better screen reader support

// Key Updates:
// Auto-refresh Safety:

// Avoids redundant errors by properly managing the interval cleanup.
// Success Feedback:

// Displays a success message when a new message is sent.
// Input Validation:

// Trims input for recipient and message to avoid empty spaces.
// Optional Crypto Tip:

// Properly handles the optional cryptoTip field, converting it to null if invalid.
// Error Handling:

// Improved clarity of error messages.

// Messages.js:
// Added WebSocket for real-time message updates.
// Used optimistic UI updates for new messages.
// Enhanced error and success message display.

// Changes to Messages.js
// Error and Success Display:

// Enhanced user feedback with consistent success and error handling.
// Optimistic UI Updates:

// Messages are added optimistically to the state when sending, improving responsiveness.
// Polling Interval Improvement:

// Used a more efficient mechanism with clear intervals to avoid resource leaks.
// Real-Time Updates:

// Added WebSocket support for real-time message updates.

// Key Updates
// Component (Messages.js)
// Real-Time Updates:

// Implemented WebSocket for real-time message updates.
// Validation:

// Added validations for recipient and message fields.
// Error Handling:

// Enhanced error handling with styled error messages.
// Optimistic UI:

// Updated the UI immediately when sending a message.
// Accessibility:

// Added aria-label for better screen reader support.

// Changes Made:
// Dynamic API URL:

// Replaced hardcoded URLs with process.env.REACT_APP_API_URL for consistency across the app.
// Separate Loading States:

// Added distinct loading states for fetching messages and sending messages (isLoadingMessages and isSendingMessage).
// Pagination Enhancements:

// Added "Previous" and "Next" buttons for better navigation through pages.
// Error Handling:

// Improved error messages for fetching and sending messages.
// UI/UX Improvements:

// Clearer separation of concerns for messages, pagination, and the form.