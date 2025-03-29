/**
 * Post Component
 *
 * This component represents an individual post in the feed.
 * - Displays post details (author, content, media, crypto tags).
 * - Supports interactions: liking, retweeting, and commenting.
 * - Handles WebSocket events for real-time updates.
 * - Uses batch API calls to optimize fetching like/retweet/comment counts.
 *
 * Features:
 * - **Handles retweets** (shows original post and retweeter details).
 * - **Real-time updates** via WebSocket (`socket.on("new-comment")`).
 * - **Optimized API calls**: avoids excessive requests by using batch fetching.
 */


import React, { useState, useEffect, useContext } from "react";
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
import { AuthContext } from "@/context/AuthContext"; // Import AuthContext
import "@/css/components/Post_components/Post.css";

function Post({ post, currentUser, onNewComment, setPosts }) {
    const [postComments, setPostComments] = useState(post.comments || []);
    const { likedPosts, retweetedPosts } = useContext(AuthContext); // Get batch data from context
    const [commentCount, setCommentCount] = useState(post.commentCount || 0); // ✅ use prop if available
    const [isOverlayVisible, setOverlayVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const [author, setAuthor] = useState(post.author || "");
    




    //  Ensure likes & retweets sync between the original post and retweets
    const isRetweet = post.isRetweet;
    const postIdToUse = isRetweet ? post.originalPostId : post.id;
    const retweeterName = isRetweet ? post.retweeterName || post.user?.username : null;
    const postAuthor = isRetweet && post.originalAuthor ? post.originalAuthor : post.author;
    const postProfilePicture = isRetweet && post.originalProfilePicture
    ? post.originalProfilePicture.startsWith("http")
        ? post.originalProfilePicture
        : `http://localhost:5001${post.originalProfilePicture.startsWith("/uploads") ? post.originalProfilePicture : `/uploads/${post.originalProfilePicture}`}`
    : post.profilePicture
        ? post.profilePicture.startsWith("http")
            ? post.profilePicture
            : `http://localhost:5001${post.profilePicture.startsWith("/uploads") ? post.profilePicture : `/uploads/${post.profilePicture}`}`
        : "http://localhost:5001/uploads/default-avatar.png";



    // Fetch batch like/retweet statuses ONCE per user
    // useEffect(() => {
    //     if (!currentUser?.id) return;

    //     const fetchLikesAndRetweets = async () => {
    //         try {
    //             const [likeResponse, retweetResponse] = await Promise.all([
    //                 api.get("/posts/likes/batch"),
    //                 api.get("/posts/retweets/batch")
    //             ]);

    //             setLikedPosts(new Set(likeResponse.data.likedPosts));
    //             setRetweetedPosts(new Set(retweetResponse.data.retweetedPosts));
    //         } catch (err) {
    //             console.error("Error fetching batch data:", err);
    //         }
    //     };

    //     fetchLikesAndRetweets();
    // }, [currentUser]);



     // 🔹 Ensure the correct author and profile picture are displayed
     useEffect(() => {
        if (post.userId && (!author || !post.profilePicture)) {
            const fetchUser = async () => {
                try {
                    const response = await api.get(`/users/${post.userId}`);
                    setAuthor(response.data.username);
                    setProfilePicture(
                        response.data.user.profilePicture
                            ? `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/uploads/${response.data.user.profilePicture}`
                            : "http://localhost:5001/uploads/default-avatar.png"
                    );
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




    // Listen for new comments in websocket and update ui. 
    useEffect(() => {
        const handleNewComment = (comment) => {
            if (comment.postId === postIdToUse) {
                setPostComments((prev) => [comment, ...prev]);
                setCommentCount((prev) => prev + 1);
                onNewComment(comment);
            }
        };

        socket.off("new-comment").on("new-comment", handleNewComment); // Ensure only one listener exists

        return () => {
            socket.off("new-comment", handleNewComment); // Proper cleanup
        };
    }, [postIdToUse, onNewComment]);
    

    const handleToggleOverlay = async () => {
        if (!isOverlayVisible) {  
            try {
                const response = await api.get(`/comments?postId=${postIdToUse}`);
                setPostComments(response.data.comments); // Fetch latest comments
            } catch (error) {
                console.error("Failed to fetch comments for modal:", error);
            }
            document.body.classList.add("overlay-open");
        } else {
            document.body.classList.remove("overlay-open");
        }
        setOverlayVisible(!isOverlayVisible);
    };
    

    // Listens for new comments via WebSocket and updates the UI.
    const handleAddComment = async () => {
        if (!newComment.trim()) return;
    
        setLoading(true);
        setErrorMessage("");
    
        try {
            const { data } = await api.post("/comments", { postId: postIdToUse, content: newComment.trim() }); // Fixed postId reference
    
            // Ensure comment list updates correctly
            onNewComment(data.comment); // 👈 ensures avatar + author included
            setNewComment("");
            setShowCommentOverlay(false);
        } catch (error) {
            console.error("Failed to add comment:", error);
            setErrorMessage("Failed to add comment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

        // Ensure likes update globally
        const handleLikeToggle = (postId, updatedLikes) => {
            setPosts((prevPosts) =>
                prevPosts.map((p) =>
                    p.id === postId || p.originalPostId === postId
                        ? { ...p, likes: updatedLikes }
                        : p
                )
            );
        };
    
        // Ensure retweets update globally
        const handleRetweetToggle = (postId, isReposting, updatedRetweets, newRetweetData) => {
            setPosts((prevPosts) => {
                let updatedPosts = prevPosts.map((p) =>
                    p.id === postId || p.originalPostId === postId
                        ? { ...p, retweets: updatedRetweets }
                        : p
                );
    
                if (isReposting && newRetweetData) {
                    updatedPosts = [newRetweetData, ...updatedPosts]; // Add new repost to the feed
                }
    
                return updatedPosts;
            });
        };


    // Deletes a post with a fade-out effect before removal.
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
                {post.userId === currentUser.id
                    ? "You reposted"
                    : `${retweeterName || "Unknown"} reposted`}
            </div>
        )}


    
<div className="post-content-wrapper">
                <img
                    src={postProfilePicture}
                    alt={`${postAuthor}'s profile`}
                    className="post-profile-picture"
                />
                <div className="individual-post-content-wrapper">
                    <div className="individual-post-header">
                        <div className="post-author-details">
                        <Link to={`/profile/${post.isRetweet ? post.originalUserId : post.userId}`} className="post-author-link">
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
                                {isDeleting ? "Processing..." : isRetweet ? "Undo Repost" : "Delete"}
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
    
                    {/* ✅ Updated Like & Retweet Buttons to sync with batch data */}
                    <div className="individual-post-actions">
                        <LikeButton
                            postId={postIdToUse}
                            originalPostId={post.originalPostId}
                            initialLikes={post.likes}
                            currentUser={currentUser}
                            onLikeToggle={handleLikeToggle}
                            setPosts={setPosts}
                        />
                        <RetweetButton
                            postId={postIdToUse}
                            originalPostId={post.originalPostId}
                            initialRetweets={post.retweets}
                            currentUser={currentUser}
                            onRetweetToggle={handleRetweetToggle}
                            setPosts={setPosts}
                        />
                        <CommentSection
                            postId={postIdToUse}
                            originalPostId={post.originalPostId}
                            onNewComment={onNewComment || (() => {})}
                            setPosts={setPosts}
                        />
                    </div>
    
                    <div className="view-comments-link">
                        <a href="#" onClick={(e) => { e.preventDefault(); setModalOpen(true); }} className="view-comments-link">
                            View All Comments ({commentCount})
                        </a>
                    </div>
    
                    {isModalOpen && (
                        <PostModal 
                            post={post} 
                            onClose={() => setModalOpen(false)} 
                            likedPosts={likedPosts} // Pass to modal
                            retweetedPosts={retweetedPosts} // Pass to modal
                        />
                    )}
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
    onNewComment: PropTypes.func,
    setPosts: PropTypes.func, // Ensures global state updates
};

export default Post;


/**
 * Potential Improvements:
 * 1. **Lazy Loading for Images/Videos** - Improve performance for large media files.
 * 2. **Better Error Handling** - Show detailed error messages on UI.
 * 3. **Enhance WebSocket Handling** - Add animations when new comments arrive.
 */