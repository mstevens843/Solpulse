import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { api } from "@/api/apiConfig";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import "@/css/components/CommentList.css";

function CommentList({ postId, currentUser, onClose }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        fetchComments();
        document.body.classList.add("overlay-open");

        return () => {
            document.body.classList.remove("overlay-open");
        };
    }, [postId]);

    const fetchComments = async (page = 1) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/comments?postId=${postId}&page=${page}&limit=10`);
            setComments(page === 1 ? data.comments : [...comments, ...data.comments]);
            setHasMore(page < data.pages);
        } catch (error) {
            console.error("Failed to fetch comments:", error);
            setErrorMessage("Failed to load comments.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        setDeletingCommentId(commentId);
        try {
            await api.delete(`/comments/${commentId}`);
            setComments(comments.filter(comment => comment.id !== commentId));

            toast.success("Comment deleted successfully!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
            });
        } catch (error) {
            console.error("Failed to delete comment:", error);
            toast.error("Failed to delete comment. Please try again.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
            });
        } finally {
            setDeletingCommentId(null);
        }
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setPage(page + 1);
            fetchComments(page + 1);
        }
    };

    return (
        <div className="comment-list-overlay" onClick={onClose}>
            <ToastContainer />
            <div className="comment-list-container" onClick={(e) => e.stopPropagation()}>
                <div className="comment-list-header">
                    <h3>Comments</h3>
                    <button className="close-overlay-button" onClick={onClose}>✖</button>
                </div>

                {errorMessage && <p className="comment-list-error">{errorMessage}</p>}

                <div className="comment-list">
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment.id} className="comment-item">
                                <p className="comment-author">{comment.author || "Anonymous"}</p>
                                <p className="comment-content">{comment.content}</p>

                                {currentUser?.id === comment.userId && (
                                    <button
                                        className="delete-comment-button"
                                        onClick={() => handleDeleteComment(comment.id)}
                                        disabled={deletingCommentId === comment.id}
                                    >
                                        {deletingCommentId === comment.id ? "Deleting..." : "Delete"}
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="comment-list-empty">No comments yet.</p>
                    )}
                </div>

                {hasMore && (
                    <button onClick={handleLoadMore} disabled={loading} className="load-more-button">
                        {loading ? "Loading..." : "Load More Comments"}
                    </button>
                )}
            </div>
        </div>
    );
}

CommentList.propTypes = {
    postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    currentUser: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }),
    onClose: PropTypes.func.isRequired,
};

export default CommentList;
