import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { api } from "@/api/apiConfig";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import LikeButton from "@/components/LikeButton";
import RetweetButton from "@/components/RetweetButton";
import CommentSection from "@/components/CommentSection";
import CommentList from "@/components/CommentList";
import socket from "@/socket";
import "@/css/components/Post.css";

function Post({ post, currentUser, onNewComment }) {
    const [postComments, setPostComments] = useState(post.comments || []);
    const [commentCount, setCommentCount] = useState(0);
    const [isOverlayVisible, setOverlayVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [author, setAuthor] = useState(post.author || "");
    const [profilePicture, setProfilePicture] = useState(post.profilePicture || "/default-avatar.png");



    useEffect(() => {
        if (post.userId && !author || !post.profilePicture ) {
            const fetchUser = async () => {
                try {
                    const response = await api.get(`/users/${post.userId}`);
                    setAuthor(response.data.username);
                    setProfilePicture(response.data.user.profilePicture || "/default-avatar.png");
                } catch (error) {
                    console.error("Error fetching user:", error);
                }
            };
            fetchUser();
        }
    }, [post.userId, author, post.profilePicture]);

    const hasComments = postComments.length > 0;

    const formatDate = (date) =>
        date ? new Date(date).toLocaleString() : "Date not available";

    // Handle WebSocket Events
    useEffect(() => {
        const fetchCommentCount = async () => {
            try {
                const response = await api.get(`/comments/count?postId=${post.id}`);
                setCommentCount(response.data.count);
            } catch (error) {
                console.error("Failed to fetch comment count:", error);
            }
        };

        fetchCommentCount();
    }, [post.id]);

    useEffect(() => {
        const handleNewComment = (comment) => {
            if (comment.postId === post.id) {
                setPostComments((prev) => [comment, ...prev]);
                setCommentCount((prev) => prev + 1);
                onNewComment(comment);
            }
        };

        socket.on("new-comment", handleNewComment);

        return () => {
            socket.off("new-comment", handleNewComment);
        };
    }, [post.id, onNewComment]);

    const handleToggleOverlay = () => {
        setOverlayVisible((prev) => {
            if (!prev) {
                document.body.classList.add("overlay-open");
            } else {
                document.body.classList.remove("overlay-open");
            }
            return !prev;
        });
    };

    const handleAddComment = (newComment) => {
        setPostComments((prev) => [newComment, ...prev]);
        setCommentCount((prev) => prev + 1);
    };


    const handleDeletePost = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/posts/${post.id}`);

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
            <ToastContainer />
            <img
                src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${profilePicture}?timestamp=${new Date().getTime()}`}
                alt={`${post.author}'s profile`}
                className="post-profile-picture"
            />
            <div className="individual-post-content-wrapper">
                <div className="individual-post-header">
                    <div className="post-author-details">
                        <Link to={`/profile/${post.userId}`} className="post-author-link">
                            <h4 className="individual-post-author">{post.author}</h4>
                        </Link>
                        <p className="individual-post-date">{formatDate(post.createdAt)}</p>
                    </div>
                    {currentUser?.id === post.userId && (
                        <button
                            className="delete-post-button"
                            onClick={handleDeletePost}
                        >
                            Delete
                        </button>
                    )}
                </div>
    
                {/* Post Content Section */}
                <div className="individual-post-content">
                    <p>{post.content || "No content available."}</p>
                    
                    {/* CryptoTag Section */}
                    {post.cryptoTag && (
                        <p className="individual-post-crypto-tag">
                            <span role="img" aria-label="crypto-tag">🏷️</span> {post.cryptoTag}
                        </p>
                    )}
                </div>
    
                {/* Media Content */}
                {post.mediaUrl && (
                    <div className="individual-post-media">
                        {post.mediaUrl.endsWith(".mp4") ? (
                            <video controls className="post-video">
                                <source src={post.mediaUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <img src={post.mediaUrl} alt="Post media" className="post-image" />
                        )}
                    </div>
                )}
    
                <div className="individual-post-actions">
                    <LikeButton postId={post.id} currentUser={currentUser} initialLikes={post.likes || 0} />
                    <RetweetButton postId={post.id} currentUser={currentUser} initialRetweets={post.retweets || 0} />
                    <CommentSection postId={post.id} onNewComment={onNewComment} />
                </div>
    
                <div className="view-comments-link">
                    <a href="#" onClick={handleToggleOverlay} className="view-comments-link">
                         View All Comments ({commentCount})
                    </a>
                </div>
    
                {isOverlayVisible && (
                    <CommentList 
                        postId={post.id} 
                        currentUser={currentUser} 
                        onClose={handleToggleOverlay} 
                    />
                )}
            </div>
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
        cryptoTag: PropTypes.string,
        createdAt: PropTypes.string,
        profilePicture: PropTypes.string,
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
