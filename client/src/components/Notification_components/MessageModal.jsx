import React, { useState } from "react";
import "@/css/components/Notification_components/MessageModal.css"; 

const MessageModal = ({ message, onClose, onReply }) => {
  const [newMessage, setNewMessage] = useState("");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Message from {message.sender}</h2>
        <div className="message-content">
          <p>{message.content}</p>
        </div>

        <textarea
          className="reply-textarea"
          placeholder="Write your reply here..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          required
        />

        <div className="modal-actions">
          <button onClick={onClose} className="close-btn">Close</button>
          <button
            onClick={() => onReply(message.id, newMessage)}
            className="reply-btn"
            disabled={!newMessage.trim()} // Prevent empty replies
          >
            Reply
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
