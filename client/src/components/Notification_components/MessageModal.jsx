/**
 * MessageModal Component
 *
 * - Displays a received message inside a modal.
 * - Allows the user to send a reply.
 * - Prevents empty replies from being sent.
 */

import React, { useState } from "react";
import "@/css/components/Notification_components/MessageModal.css";
import { Picker } from 'emoji-mart';
import data from "@emoji-mart/data";


const MessageModal = ({ message, onClose, onReply }) => {
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  
  /**
   * Prevents modal from closing when clicking inside the content.
   */
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  /**
   * Sends a reply to the message sender.
   * - Prevents empty messages from being sent.
   */
  const handleReply = () => {
    if (newMessage.trim()) {
      onReply(message.id, newMessage);
      setNewMessage(""); // Reset input field after reply
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={handleModalClick}>
        <h2>Message from {message.sender}</h2>

        {/* Message Content */}
        <div className="message-content">
          <p>{message.content}</p>
        </div>

        {/* Reply Textarea */}
        <textarea
          className="reply-textarea"
          placeholder="Write your reply here..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          required
        />
          {/* Toggle Button */}
          <button onClick={() => setShowEmojiPicker((prev) => !prev)} className="emoji-toggle-btn">
            😊
          </button>
          {showEmojiPicker && (
            <Picker
              data={data} // required
              onEmojiSelect={(emoji) => {
                setNewMessage((prev) => prev + emoji.native);
                setShowEmojiPicker(false); 
              }}
              title="Pick an emoji"
              emoji="point_up"
              style={{ width: "100%", marginTop: "0.5rem" }} 
            />
          )}

        {/* Modal Actions (Reply & Close Buttons) */}
        <div className="modal-actions">
          <button onClick={onClose} className="close-btn">Close</button>
          <button
            onClick={handleReply}
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