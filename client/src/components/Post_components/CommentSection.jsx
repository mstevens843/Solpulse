import React, { useState } from "react";
import PropTypes from "prop-types";
import { api } from "@/api/apiConfig";
import "@/css/components/Post_components/CommentSection.css";

function CommentSection({ postId, originalPostId, onNewComment, setPosts }) { // Pass setPosts for global updates
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showCommentOverlay, setShowCommentOverlay] = useState(false);

    const actualPostId = originalPostId || postId; // Ensure comments go to the original post if retweeted

    const handleAddComment = async () => {
        if (!newComment.trim() || loading) return; // Prevent duplicate requests
    
        setLoading(true);
    
        try {
            const { data } = await api.post("/comments", { postId: actualPostId, content: newComment.trim() });

            setErrorMessage(""); // Clear errors only after success
            setNewComment(""); // Reset only on success
            onNewComment(data);
            setShowCommentOverlay(false);

            // Update comments count globally in posts
            setPosts((prevPosts) =>
                prevPosts.map((p) =>
                    p.id === actualPostId || p.originalPostId === actualPostId
                        ? { ...p, comments: (p.comments || 0) + 1 }
                        : p
                )
            );
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
                        {errorMessage && <p className="error-message" aria-live="assertive">{errorMessage}</p>} {/* Accessibility improvement */}
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
