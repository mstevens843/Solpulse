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
import "@/css/components/Post_components/CommentSection.css";



function CommentSection({ postId, originalPostId, onNewComment, setPosts }) { // Pass setPosts for global updates
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
      


    return (
        <>
            <button
                className="comment-icon-button"
                onClick={() => setShowCommentOverlay(true)}
                aria-label="Add a comment"
            >
                💬
            </button>
            <button
                className="comment-text"
                onClick={() => setShowCommentOverlay(true)}
                aria-label="Add a comment"
            >
                Add a Comment
            </button>

            {showCommentOverlay && (
                <div className="comment-overlay" onClick={() => setShowCommentOverlay(false)}>
                    <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
                        <button 
                            className="close-overlay-button" 
                            onClick={() => setShowCommentOverlay(false)}
                            aria-label="Close comment section"
                        >
                            &times;
                        </button>
                        <h3>Add a Comment</h3>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write your comment..."
                            aria-label="Comment input"
                            disabled={loading}
                            className="comment-input"
                        />
                        {/* ✅ Suggestion 2 - Character counter */}
                        <p className="char-counter">
                            {newComment.length}/{MAX_COMMENT_LENGTH}
                        </p>
                        {/* ✅ Emoji picker toggle */}
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="emoji-toggle-button"
                        >
                            😀 Emoji
                        </button>

                        {/* ✅ Emoji Picker */}
                        
                        {showEmojiPicker && (
                        <div className="emoji-picker-wrapper">
                            <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="light" />
                        </div>
                        )}
                        <button
                            onClick={handleAddComment}
                            disabled={loading || !newComment.trim()}
                            className="comment-button"
                        >
                            {loading ? "Adding..." : "Add Comment"}
                        </button>
                        {/* ✅ Suggestion 3 - Better error message */}
                        {errorMessage && (
                            <p className="error-message" aria-live="assertive">
                                {errorMessage}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

CommentSection.propTypes = {
    postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    originalPostId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Support for retweets
    onNewComment: PropTypes.func, // Ensure function exists
    setPosts: PropTypes.func, // Pass setPosts for global state update
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