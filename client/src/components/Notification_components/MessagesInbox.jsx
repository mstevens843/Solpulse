import React, { useState, useEffect } from "react";
import { api } from "@/api/apiConfig";
import Loader from "@/components/Loader";
import MessageModal from "@/components/Notification_components/MessageModal";
import "@/css/components/Notification_components/MessagesInbox.css";


function MessagesInbox() {
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
    setSuggestedRecipients([]);
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

export default MessagesInbox;