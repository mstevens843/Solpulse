/**
 * RetweetButton Component
 *
 * - Allows users to repost or undo reposts of a given post.
 * - Updates retweet count dynamically and syncs with global state.
 * - Uses sessionStorage to persist retweet state across sessions.
 * - Calls parent `setPosts` function to ensure UI updates globally.
 */

import React, { useState, useContext, useRef } from "react"; // ← add useRef
import PropTypes from "prop-types";
import { api } from "@/api/apiConfig"; 
import { AuthContext } from "@/context/AuthContext";
import RepostCount from "@/components/Post_components/Actions/RepostCount";
import { toast } from "react-toastify";
import "@/css/components/Post_components/Actions/PostButtons.css"; 

function RetweetButton({ postId, originalPostId, initialRetweets = 0, currentUser, onRetweetToggle, setPosts }) {
    const { retweetedPosts, setRetweetedPosts } = useContext(AuthContext); 
    const [retweetCount, setRetweetCount] = useState(initialRetweets);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(""); // ✅ for showing retry errors
    const actualPostId = originalPostId || postId;
    const hasRetweeted = retweetedPosts.has(actualPostId); // Check batch data
    const debounceRef = useRef(null); // ✅ debounce to avoid double taps




    /**
     * Handles retweet toggling:
     * - If user has already retweeted, it will undo the retweet.
     * - If user hasn't retweeted, it will create a new repost.
     * - Updates UI, global state, and triggers parent updates.
     */
    const handleRetweetToggle = async () => {
        if (loading || !currentUser?.id) {
            if (!currentUser?.id) toast.error("You need to log in to repost.");
            return;
        }
    
        if (debounceRef.current) return;
        debounceRef.current = setTimeout(() => {
            debounceRef.current = null;
        }, 600);
    
        setLoading(true);
        setError("");
    
        try {
            if (hasRetweeted) {
                //  UNDO RETWEET
                const response = await api.delete(`/posts/${actualPostId}/retweet`);
                const updatedRetweets = Math.max(0, response.data.retweets);
    
                setRetweetCount(updatedRetweets);
                toast.success("Repost removed successfully!");
    
                setRetweetedPosts((prev) => {
                    const updated = new Set(prev);
                    updated.delete(actualPostId);
                    sessionStorage.setItem("retweetedPosts", JSON.stringify([...updated]));
                    return updated;
                });
    
                if (onRetweetToggle) {
                    onRetweetToggle(actualPostId, false, updatedRetweets);
                }
    
                setPosts((prevPosts) =>
                    prevPosts.map((p) =>
                        p.id === actualPostId || p.originalPostId === actualPostId
                            ? { ...p, retweets: updatedRetweets }
                            : p
                    )
                );
            } else {
                // ✅ DO RETWEET
                const response = await api.post(`/posts/${actualPostId}/retweet`, {
                    userId: currentUser.id,
                });
    
                const newRetweet = response.data.retweetData;
                const updatedRetweets = newRetweet.retweets;
    
                setRetweetCount(updatedRetweets);
    
                setRetweetedPosts((prev) => {
                    const updated = new Set(prev);
                    updated.add(actualPostId);
                    sessionStorage.setItem("retweetedPosts", JSON.stringify([...updated]));
                    return updated;
                });
    
                if (onRetweetToggle) {
                    onRetweetToggle(actualPostId, true, updatedRetweets, {
                        id: newRetweet.id,
                        userId: newRetweet.userId,
                        author: newRetweet.originalAuthor,
                        profilePicture: newRetweet.originalProfilePicture,
                        content: newRetweet.content,
                        mediaUrl: newRetweet.mediaUrl,
                        cryptoTag: newRetweet.cryptoTag,
                        likes: newRetweet.likes,
                        retweets: updatedRetweets,
                        comments: newRetweet.comments,
                        isRetweet: true,
                        originalPostId: actualPostId,
                        originalAuthor: newRetweet.originalAuthor,
                        originalProfilePicture: newRetweet.originalProfilePicture,
                        createdAt: newRetweet.createdAt,
                    });
                }
    
                setPosts((prevPosts) =>
                    prevPosts.map((p) =>
                        p.id === actualPostId || p.originalPostId === actualPostId
                            ? { ...p, retweets: updatedRetweets }
                            : p
                    )
                );
    
                toast.success("Post reposted successfully!");
            }
        } catch (err) {
            console.error("Error toggling repost:", err);
            toast.error("Failed to update repost status.");
            setError("Failed to update repost status. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="retweet-button-container">
            <button
                onClick={handleRetweetToggle}
                disabled={loading}
                className={`retweet-button ${hasRetweeted ? "retweeted" : ""}`}
                aria-label={`${hasRetweeted ? "Undo Repost" : "Repost"} post. Current reposts: ${retweetCount}`}
                aria-pressed={hasRetweeted}
            >
                {loading ? "Processing..." : (
                <>
                {loading ? "..." : hasRetweeted ? `🔁 ${retweetCount}` : `↪️ ${retweetCount}`}
                </>
                )}           
            </button>

            {/* Show retry button if error */}
            {error && (
            <div className="retweet-error" role="alert" aria-live="assertive">
                <p>{error}</p>
                <button onClick={handleRetweetToggle} disabled={loading} className="retry-retweet-btn">
                Retry
                </button>
            </div>
            )}
        </div>
    );
}

RetweetButton.propTypes = {
    postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    originalPostId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    initialRetweets: PropTypes.number,
    currentUser: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        username: PropTypes.string.isRequired,
    }).isRequired,
    onRetweetToggle: PropTypes.func, // Optional function to sync parent state
    setPosts: PropTypes.func.isRequired, // Required to propagate UI updates
};

export default RetweetButton;