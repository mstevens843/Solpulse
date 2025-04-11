/**
 * This file is responsible for managing the user's inbox, allowing them to:
 * - View, send, and reply to messages.
 * - Search for recipients and select from recent message history.
 * - Mark messages as read and handle pagination for browsing older messages.
 *
 * Features:
 * - Fetches messages on mount and updates dynamically when a new message is sent.
 * - Implements a debounced search for users to reduce unnecessary API calls.
 * - Uses modals for sending new messages and viewing full message details.
 * - Handles pagination for browsing messages efficiently.
 */

import React, { useState, useEffect } from "react";
import { api } from "@/api/apiConfig";
import { Picker } from 'emoji-mart';
import data from "@emoji-mart/data";
import Loader from "@/components/Loader";
import MessageModal from "@/components/Notification_components/MessageModal";
import "@/css/components/Notification_components/Messages.css";


function Messages() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [recipient, setRecipient] = useState("");
  const [suggestedRecipients, setSuggestedRecipients] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [attachment, setAttachment] = useState(null); // ✅ #2 Track selected file attachment
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // ✅ Toggle for emoji picker
  const [activeTab, setActiveTab] = useState("inbox");
  const [blockedUserIds, setBlockedUserIds] = useState([]);
  const [mutedUserIds, setMutedUserIds] = useState([]);






  useEffect(() => {
    document.title = "Messages | Solrise";
  
    const fetchBlockedAndMuted = async () => {
      try {
        const [blockedRes, mutedRes] = await Promise.all([
          api.get("/blocked-muted/block"),
          api.get("/blocked-muted/mute"),
        ]);
        setBlockedUserIds(blockedRes.data?.blockedUserIds || []);
        setMutedUserIds(mutedRes.data?.mutedUserIds || []);
      } catch (err) {
        console.error("Failed to fetch blocked/muted users", err);
      }
    };
  
    fetchBlockedAndMuted();         // ✅ Fetch on mount/tab/page change
    fetchMessages(currentPage, activeTab); // ✅ Fetch inbox/sent messages
  }, [currentPage, activeTab]);

  useEffect(() => {
    if (showModal) {
      fetchRecentRecipients();
    }
  }, [showModal]);


  /**
   * Fetches messages from the API.
   * - Updates `messages` state and manages pagination.
   */
  const fetchMessages = async (page = 1, type = "inbox") => {
    setIsLoadingMessages(true);
    try {
      const endpoint =
        type === "sent"
          ? `/messages/sent?page=${page}`
          : `/messages?page=${page}`;
  
      const response = await api.get(endpoint);
      setMessages(response.data.messages);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
      setError("");
    } catch (err) {
      console.error(`Error fetching ${type} messages:`, err);
      setError(`Failed to load ${type} messages.`);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  
  /**
   * Fetches a list of recent recipients for quick selection.
   */
  const fetchRecentRecipients = async () => {
    try {
      const response = await api.get("/messages/recent-recipients");
      setSuggestedRecipients(response.data.recipients);
    } catch (err) {
      console.error("Error fetching recent recipients:", err);
    }
  };

  /**
   * Handles debounced user search when typing recipient username.
   */
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

  // Selects a recipent from search suggestions.
  const selectRecipient = (username) => {
    setRecipient(username);
    setSuggestedUsers([]);
    setSuggestedRecipients([]);
  };

// Sends a new message to the selected recipient.
const handleSendMessage = async (e) => {
  e.preventDefault();
  setError("");
  setSuccessMessage("");
  setIsSendingMessage(true);

  if (!recipient.trim() || !newMessage.trim()) {
    if (blockedUserIds.includes(recipient.trim())) {
      setError("You’ve blocked this user. Messaging is disabled.");
      setIsSendingMessage(false);
      return;
    }
    setError("Recipient and message are required.");
    setIsSendingMessage(false);
    return;
  }

  const formData = new FormData(); // ✅ #2 Using FormData for file + text
  formData.append("recipient", recipient.trim());
  formData.append("message", newMessage.trim());
  if (attachment) {
    formData.append("attachment", attachment);
  }

  try {
    await api.post("/messages", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }); // ✅ Send formData instead of newMessageData

    setNewMessage("");
    setRecipient("");
    setAttachment(null); // ✅ #2 Reset attachment state
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



  // Opens a message in modal view.
  const handleOpenMessage = (message) => {
    setSelectedMessage(message);
  };

  // Closes the message modal. 
  const handleCloseModal = () => {
    setSelectedMessage(null);
  };


  // Sends the reply to a message. 
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

  // Marks a message as read when clicked. 
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


      <div className="message-tabs">
        <button
          onClick={() => {
            setActiveTab("inbox");
            setCurrentPage(1);
          }}
          className={activeTab === "inbox" ? "active" : ""}
        >
          Inbox
        </button>
        <button
          onClick={() => {
            setActiveTab("sent");
            setCurrentPage(1);
          }}
          className={activeTab === "sent" ? "active" : ""}
        >
          Sent
        </button>
      </div>

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
              <strong>{activeTab === "inbox" ? msg.sender : msg.recipient}</strong>: {msg.content}
              </p>
              {msg.readAt && ( // ✅ #3 Show read receipt timestamp if available
                <p className="message-read-at">Seen at {new Date(msg.readAt).toLocaleString()}</p>
              )}
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
                    <li
                      key={user.username}
                      onClick={() => {
                        if (!blockedUserIds.includes(user.id)) {
                          selectRecipient(user.username);
                        }
                      }}
                      className={blockedUserIds.includes(user.id) ? "muted-or-blocked" : ""}
                    >
                      {user.username}
                      {blockedUserIds.includes(user.id) && (
                        <span className="blocked-tag">Blocked</span>
                      )}
                      {mutedUserIds.includes(user.id) && !blockedUserIds.includes(user.id) && (
                        <span className="muted-tag">Muted</span>
                      )}
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

              {/* ✅ Emoji toggle and picker */}
              <button
                type="button"
                className="emoji-toggle-btn"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
              >
                😊
              </button>
              {showEmojiPicker && (
                <Picker
                  data={data}
                  onEmojiSelect={(emoji) => {
                    setNewMessage((prev) => prev + emoji.native);
                    setShowEmojiPicker(false); // ✅ Auto-close picker after selection
                  }}
                  title="Pick an emoji"
                  emoji="point_up"
                  style={{ width: "100%", marginBottom: "1rem" }}
                />
              )}

              {/* ✅ #2 File attachment input */}
              <label>Attachment:</label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setAttachment(e.target.files[0])}
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


/**
 * 🔹 **Potential Improvements:**
 * - Implement real-time message updates using WebSockets. - SKIPPED
 * - Allow file attachments (images, videos) in messages.
 * - Add read receipts to indicate when a message has been seen.
 */


//* -----------------------------------------------------------------------------
//* 🆕 Emoji Picker Support (Send New Message Modal)
//* -----------------------------------------------------------------------------
//* 1. Imported `Picker` from `emoji-mart` and its required CSS.
//* 2. Added `showEmojiPicker` state to control picker visibility.
//* 3. Added a toggle button (😊) below the message textarea.
//* 4. When clicked, the picker shows and lets the user select emojis.
//* 5. Selected emojis are appended to `newMessage` using `emoji.native`.
//* 6. All existing features (user suggestions, file attachments, etc.) remain intact.
//* -----------------------------------------------------------------------------