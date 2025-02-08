import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { api } from "@/api/apiConfig";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import LikeButton from "@/components/Post_components/LikeButton";
import RetweetButton from "@/components/Post_components/RetweetButton";
import CommentSection from "@/components/Post_components/CommentSection";
import PostModal from "@/components/Post_components/PostModal";
import socket from "@/socket";
import "@/css/components/Post_components/Post.css";

function Post({ post, currentUser, onNewComment, setPosts }) {
    const [postComments, setPostComments] = useState(post.comments || []);
    const [commentCount, setCommentCount] = useState(0);
    const [isOverlayVisible, setOverlayVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const [author, setAuthor] = useState(post.author || "");
    const [profilePicture, setProfilePicture] = useState(post.profilePicture || "http://localhost:5001/uploads/default-avatar.png");
    // Determine the correct author and profile picture
    const isRetweet = post.isRetweet;
    const retweeterName = isRetweet ? currentUser.username : null;
    const postAuthor = isRetweet && post.originalAuthor ? post.originalAuthor : post.author;
    const postProfilePicture = isRetweet && post.originalProfilePicture ? post.originalProfilePicture : post.profilePicture || "http://localhost:5001/uploads/default-avatar.png";



    useEffect(() => {
        if (post.userId && !author || !post.profilePicture ) {
            const fetchUser = async () => {
                try {
                    const response = await api.get(`/users/${post.userId}`);
                    setAuthor(response.data.username);
                    setProfilePicture(response.data.user.profilePicture || "http://localhost:5001/uploads/default-avatar.png");
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
            setPosts((prevPosts) =>
                prevPosts.map((p) => (p.id === post.id ? { ...p, fading: true } : p))
            );

            setTimeout(async () => {
                await api.delete(`/posts/${post.id}`);

                setPosts((prevPosts) => prevPosts.filter((p) => p.id !== post.id));

                toast.success("Post deleted successfully!", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "dark",
                });
            }, 300);
        } catch (error) {
            console.error("Error deleting post:", error);
            toast.error("Failed to delete post. Please try again.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
            });

            setPosts((prevPosts) =>
                prevPosts.map((p) => (p.id === post.id ? { ...p, fading: false } : p))
            );
        } finally {
            setIsDeleting(false);
        }
    };

    
    
    return (
        <div className={`individual-post-container ${post.fading ? "fading" : ""}`}>
            <ToastContainer />
    
            {isRetweet && (
                <div className="repost-indicator">
                    {post.userId === currentUser.id ? "You reposted" : `${post.author || "Unknown"} reposted`}
                </div>
            )}
    
            {/* Everything below stays in a row */}
            <div className="post-content-wrapper">
                <img
                    src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${postProfilePicture}?timestamp=${new Date().getTime()}`}
                    alt={`${postAuthor}'s profile`}
                    className="post-profile-picture"
                />
                <div className="individual-post-content-wrapper">
                    <div className="individual-post-header">
                        <div className="post-author-details">
                            <Link to={`/profile/${post.isRetweet ? post.originalPostId : post.userId}`} className="post-author-link">
                                <h4 className="individual-post-author">{postAuthor}</h4>
                            </Link>
                            <p className="individual-post-date">{formatDate(post.createdAt)}</p>
                        </div>
                        {currentUser?.id === post.userId && (
                            <button
                                className="delete-post-button"
                                onClick={handleDeletePost}
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Processing..." : isRetweet ? "Remove Repost" : "Delete"}
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
                        <RetweetButton 
                            postId={post.id} 
                            currentUser={currentUser} 
                            initialRetweets={post.retweets || 0} 
                            createdAt={post.createdAt}
                            onRetweet={(retweetData) => setPosts((prevPosts) => [retweetData, ...prevPosts])}
                        />
                        <CommentSection postId={post.id} onNewComment={onNewComment} />
                    </div>
    
                    <div className="view-comments-link">
                        <a href="#" onClick={(e) => { e.preventDefault(); setModalOpen(true); }} className="view-comments-link">
                            View All Comments ({commentCount})
                        </a>
                    </div>
    
                    {isModalOpen && <PostModal post={post} onClose={() => setModalOpen(false)} />}
                </div>
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