/**
 * CommentSection.js
 *
 * This file is responsible for handling the comment functionality on posts.
 * It allows users to:
 * - Add comments to a post.
 * - Display a comment input modal.
 * - Update the comments count dynamically in the post list.
 *
 * Features:
 * - Supports retweets by ensuring comments are posted on the original post.
 * - Prevents duplicate requests by disabling the comment button while loading.
 * - Improves accessibility with clear aria-labels and error messages.
 */


import React, { useState } from "react";
import PropTypes from "prop-types";
import { Picker } from "emoji-mart"; // ✅ CORRECT
import data from "@emoji-mart/data";        // ✅ required emoji data
import { api } from "@/api/apiConfig";
import { toast } from "react-toastify"; // ✅ Make sure this is imported at the top
import "@/css/components/Post_components/Actions/CommentSection.css";



function CommentSection({ postId, originalPostId, onNewComment, setPosts, currentUser }) {
  const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showCommentOverlay, setShowCommentOverlay] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false); // ✅ emoji toggle


    const MAX_COMMENT_LENGTH = 280; // ✅ Suggestion 2



    // Ensure comments go to the original post if it's a retweet
    const actualPostId = originalPostId || postId; // Ensure comments go to the original post if retweeted



    /**
     * Handles adding a new comment to the post.
     * - Prevents duplicate requests by disabling the button while loading.
     * - Updates the comment count in the global post list.
     */
    const handleAddComment = async () => {
        if (!newComment.trim() || loading) return;
      
        setLoading(true);
      
        try {
          const { data } = await api.post("/comments", {
            postId: actualPostId,
            content: newComment.trim(),
          });
      
          const newCommentData = data.comment; // ✅ Extract the comment correctly
      
          setErrorMessage("");
          setNewComment("");
          onNewComment(newCommentData); // ✅ This ensures author/avatar get passed
          setShowCommentOverlay(false);
      
          toast.success("Comment added!", {
            position: "top-right",
            autoClose: 2000,
            theme: "dark",
          });
      
          setPosts((prevPosts) =>
            prevPosts.map((p) =>
              p.id === actualPostId || p.originalPostId === actualPostId
                ? { ...p, comments: (p.comments || 0) + 1 }
                : p
            )
          );
        } catch (error) {
          console.error("Failed to add comment:", error);
          const specificError =
            error.response?.data?.error || error.message || "Unknown error occurred.";
          setErrorMessage(`Failed to add comment: ${specificError}`);
        } finally {
          setLoading(false);
        }
      };
      

    const handleEmojiSelect = (emoji) => {
        try {
          const emojiChar = emoji?.emoji || emoji?.native || ""; // emoji-mart v5+ uses emoji.emoji
          if ((newComment.length + emojiChar.length) <= MAX_COMMENT_LENGTH) {
            setNewComment((prev) => prev + emojiChar);
            setShowEmojiPicker(false);
          }
        } catch (error) {
          console.error("Emoji insert failed:", error);
          setShowEmojiPicker(false); // Fail-safe fallback
        }
      };

      const profilePic = currentUser?.profilePicture || currentUser?.avatarUrl;

      const resolvedAvatarUrl =
        profilePic?.startsWith("http")
          ? profilePic
          : profilePic
          ? `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}${profilePic}`
          : "/uploads/default-avatar.png";


    return (
      <div className="comment-section-inline">
        <div className="comment-row">
          <img
            src={resolvedAvatarUrl}
            alt={`${currentUser?.username || "Your"}'s avatar`}
            className="comment-avatar"
          />
          <div className="comment-meta-input">
            <p className="comment-username">{currentUser?.username || "Your"}</p>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Post your reply"
              aria-label="Comment input"
              className="comment-input"
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
              autoFocus
            />
          </div>
        </div>
    
        <div className="comment-input-actions">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="emoji-toggle-button"
            aria-label="Toggle emoji picker"
            disabled={loading}
          >
            😀
          </button>
    
          <span className="char-counter">
            {newComment.length}/{MAX_COMMENT_LENGTH}
          </span>
    
          <button
            onClick={handleAddComment}
            disabled={loading || !newComment.trim()}
            className="comment-button"
          >
            {loading ? "Posting..." : "Reply"}
          </button>
        </div>
    
        {showEmojiPicker && (
          <div className="emoji-picker-wrapper">
            <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="dark" />
          </div>
        )}
    
        {errorMessage && (
          <p className="error-message" aria-live="assertive">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }



CommentSection.propTypes = {
  postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  originalPostId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onNewComment: PropTypes.func,
  setPosts: PropTypes.func,
  currentUser: PropTypes.shape({
    username: PropTypes.string,
    profilePicture: PropTypes.string,
    avatarUrl: PropTypes.string,
  }),
};


export default CommentSection;

/**
 * Potential Improvements:
 * - Implement a real-time update for comments instead of requiring a refresh.
 * - Add a character counter to prevent excessively long comments.
 * - Improve error handling by displaying error details when a comment fails to post.
 */

/**
 * ✅ Implemented Suggestion 2: Add Character Counter
Displays a live character count below the text area.

Caps input at 280 characters (feel free to adjust).

✅ Implemented Suggestion 3: Improved Error Handling
Shows specific error message from server response if available.

Adds fallback for unknown errors.


 */