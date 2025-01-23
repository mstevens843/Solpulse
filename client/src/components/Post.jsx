import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { api } from "@/api/apiConfig"; // Updated to use centralized API config
import { ToastContainer, toast } from "react-toastify"; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Toastify styles
import LikeButton from "@/components/LikeButton";
import RetweetButton from "@/components/RetweetButton";
import CommentButton from "@/components/CommentButton";
import CommentSection from "@/components/CommentSection";
import socket from "@/socket";
import "@/css/components/Post.css";

function Post({ post, currentUser, onNewComment }) {
    const [postComments, setPostComments] = useState(post.comments || []);
    const [isOverlayVisible, setOverlayVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const postWithFallback = {
        ...post,
        userId: post.userId || "Anonymous",
        author: post.author || "Anonymous",
    };

    const hasComments = postComments.length > 0;

    const formatDate = (date) =>
        date ? new Date(date).toLocaleString() : "Date not available";

    // Handle WebSocket Events
    useEffect(() => {
        const handleNewComment = (comment) => {
            if (comment.postId === postWithFallback.id) {
                setPostComments((prev) => [comment, ...prev]);
                onNewComment(comment);
            }
        };

        socket.on("new-comment", handleNewComment);

        return () => {
            socket.off("new-comment", handleNewComment);
        };
    }, [postWithFallback.id, onNewComment]);

    const handleToggleOverlay = () => {
        setOverlayVisible((prev) => !prev);
    };

    const handleAddComment = (newComment) => {
        setPostComments((prev) => [newComment, ...prev]);
        onNewComment(newComment);
    };

    const handleDeletePost = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/posts/${postWithFallback.id}`); // Using centralized API config

            // Show success toast
            toast.success("Post deleted successfully!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
            });

            setTimeout(() => {
                window.location.reload(); // Reload page to reflect changes
            }, 3000);
        } catch (error) {
            console.error("Error deleting post:", error);

            // Show error toast
            toast.error("Failed to delete post. Please try again.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="individual-post-container">
            <ToastContainer />  {/* Add ToastContainer to render notifications */}

            <div className="individual-post-header">
                <h4 className="individual-post-author">{postWithFallback.author}</h4>
                <p className="individual-post-date">{formatDate(postWithFallback.createdAt)}</p>
                {currentUser?.id && postWithFallback?.userId && currentUser.id === postWithFallback.userId && (
                    <button
                        className="delete-post-button"
                        onClick={handleDeletePost}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                )}
            </div>

            <div className="individual-post-content">
                <p>{postWithFallback.content || "No content available."}</p>
            </div>

            {postWithFallback.mediaUrl && (
                <div className="individual-post-media">
                    <img src={postWithFallback.mediaUrl} alt="Post media" />
                </div>
            )}

            <div className="individual-post-actions">
                <LikeButton postId={postWithFallback.id} currentUser={currentUser} initialLikes={postWithFallback.likes || 0} />
                <RetweetButton postId={postWithFallback.id} currentUser={currentUser} initialRetweets={postWithFallback.retweets || 0} />
                <CommentButton postId={postWithFallback.id} initialCommentCount={postComments.length} currentUser={currentUser} />
            </div>

            <div className="view-comments-link">
                {hasComments ? (
                    <a href="#" onClick={handleToggleOverlay} className="view-comments-link">
                        View All Comments ({postComments.length})
                    </a>
                ) : (
                    <p className="individual-no-comments"></p>
                )}
            </div>

            <CommentSection postId={postWithFallback.id} initialComments={postComments} onAddComment={handleAddComment} currentUser={currentUser} />

            {isOverlayVisible && (
                <div className="comment-overlay">
                    <div className="overlay-content">
                        <button onClick={handleToggleOverlay} className="close-overlay-button">
                            Close
                        </button>
                        <CommentSection postId={postWithFallback.id} initialComments={postComments} onAddComment={handleAddComment} currentUser={currentUser} />
                    </div>
                </div>
            )}
        </div>
    );
}

Post.propTypes = {
    post: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        author: PropTypes.string,
        content: PropTypes.string,
        mediaUrl: PropTypes.string,
        createdAt: PropTypes.string,
        likes: PropTypes.number,
        retweets: PropTypes.number,
        comments: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
                author: PropTypes.string,
                content: PropTypes.string.isRequired,
                postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            })
        ),
    }).isRequired,
    currentUser: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }).isRequired,
    onNewComment: PropTypes.func.isRequired, 
};

export default Post;
