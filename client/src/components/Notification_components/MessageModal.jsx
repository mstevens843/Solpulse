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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // ✅ Toggle state

  
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
                setShowEmojiPicker(false); // ✅ Auto-close after emoji selection
              }}
              title="Pick an emoji"
              emoji="point_up"
              style={{ width: "100%", marginTop: "0.5rem" }} // ✅ Clean spacing
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

/**
 * 🔹 **Potential Improvements:**
 * 1. **Add Emoji Support**:
 *    - Integrate an emoji picker for richer message replies.
 *
 * 2. **Enable Multi-Line Replies**:
 *    - Allow `Shift + Enter` for new lines without submitting the reply.
 *
 * 3. **WebSocket Support**:
 *    - Auto-update UI with real-time replies without requiring a manual refresh.
 *
 * 4. **Message Encryption**:
 *    - Implement end-to-end encryption for private messages.
 *
 * 5. **Improved UI/UX**:
 *    - Add animations for opening and closing the modal.
 *    - Display timestamps for messages.
 */


//* -----------------------------------------------------------------------------
//* 🆕 Emoji Picker Support (Reply to Message Modal)
//* -----------------------------------------------------------------------------
//* 1. Imported `Picker` from `emoji-mart` and its required CSS.
//* 2. Added `showEmojiPicker` state to control emoji picker visibility.
//* 3. Added a toggle button (😊) under the reply textarea.
//* 4. When opened, the emoji picker allows emoji selection.
//* 5. Selected emojis are appended to the `newMessage` input.
//* 6. Picker conditionally renders only when toggled on.
//* 7. All other modal functionality (reply, close, validations) is preserved.
//* -----------------------------------------------------------------------------
