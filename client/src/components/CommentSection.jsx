import React, { useState } from "react";
import PropTypes from "prop-types";
import { api } from "@/api/apiConfig";
import "@/css/components/CommentSection.css";

function CommentSection({ postId, onNewComment }) {
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showCommentOverlay, setShowCommentOverlay] = useState(false);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        setLoading(true);
        setErrorMessage("");

        try {
            const { data } = await api.post("/comments", { postId, content: newComment.trim() });
            setNewComment(""); // Clear input field
            onNewComment(data); // Notify parent to update count
            setShowCommentOverlay(false);
        } catch (error) {
            console.error("Failed to add comment:", error);
            setErrorMessage("Failed to add comment. Please try again.");
        } finally {
            setLoading(false);
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
                        <button
                            onClick={handleAddComment}
                            disabled={loading || !newComment.trim()}
                            className="comment-button"
                        >
                            {loading ? "Adding..." : "Add Comment"}
                        </button>
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                    </div>
                </div>
            )}
        </>
    );
}

CommentSection.propTypes = {
    postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onNewComment: PropTypes.func.isRequired, // Required callback
};

export default CommentSection;
