import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import CommentList from "./CommentList";
import { api } from "@/api/apiConfig";
import "@/css/components/PostButtons.css";

function CommentButton({ postId, initialCommentCount = 0 }) {
    const [commentCount, setCommentCount] = useState(initialCommentCount);
    const [isOverlayVisible, setOverlayVisible] = useState(false);

    const fetchCommentCount = useCallback(async () => {
        try {
            const { data } = await api.get(`/comments?postId=${postId}`);
            setCommentCount(data.comments.length);
        } catch (error) {
            console.error("Failed to fetch comment count:", error);
        }
    }, [postId]);

    useEffect(() => {
        fetchCommentCount();
    }, [fetchCommentCount]);

    const handleToggleOverlay = () => {
        setOverlayVisible((prev) => !prev);
    };

    return (
        <div className="comment-button-container">
            <button
                onClick={handleToggleOverlay}
                className="comment-button"
                aria-label={`View comments. Total comments: ${commentCount}`}
            >
                {commentCount > 0 ? `View Comments (${commentCount})` : "No comments yet."}
            </button>

            {isOverlayVisible && (
                <CommentList postId={postId} onClose={handleToggleOverlay} />
            )}
        </div>
    );
}

CommentButton.propTypes = {
    postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    initialCommentCount: PropTypes.number,
};

export default CommentButton;









