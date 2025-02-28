import React, { useState, useContext } from "react";
import PropTypes from "prop-types";
import { api } from "@/api/apiConfig"; 
import { AuthContext } from "@/context/AuthContext"; // ✅ Import AuthContext
import { toast } from "react-toastify";
import "@/css/components/Post_components/PostButtons.css"; 

function RetweetButton({ postId, originalPostId, initialRetweets = 0, currentUser, onRetweetToggle, setPosts }) {
    const { retweetedPosts, setRetweetedPosts } = useContext(AuthContext); // ✅ Use AuthContext
    const [retweetCount, setRetweetCount] = useState(initialRetweets);
    const [loading, setLoading] = useState(false);

    const actualPostId = originalPostId || postId;
    const hasRetweeted = retweetedPosts.has(actualPostId); // ✅ Check batch data

    const handleRetweetToggle = async () => {
        if (loading || !currentUser?.id) {
            if (!currentUser?.id) toast.error("You need to log in to repost.");
            return;
        }
        setLoading(true);
    
        try {
            if (hasRetweeted) {
                // ✅ Un-retweet (Remove Retweet)
                const response = await api.delete(`/posts/${actualPostId}/retweet`);
                const updatedRetweets = Math.max(0, response.data.retweets);
    
                setRetweetCount(updatedRetweets);
                toast.success("Repost removed successfully!");
    
                // ✅ Update global context
                setRetweetedPosts((prev) => {
                    const updated = new Set(prev);
                    updated.delete(actualPostId);
                    sessionStorage.setItem("retweetedPosts", JSON.stringify([...updated]));
                    return updated;
                });

                if (onRetweetToggle) onRetweetToggle(actualPostId, false, updatedRetweets);
    
                // ✅ Update UI after un-retweeting
                setPosts((prevPosts) =>
                    prevPosts.map((p) =>
                        p.id === actualPostId || p.originalPostId === actualPostId
                            ? { ...p, retweets: updatedRetweets }
                            : p
                    )
                );
            } else {
                // ✅ Retweet (New Repost)
                const response = await api.post(`/posts/${actualPostId}/retweet`, { userId: currentUser.id });
                const newRetweet = response.data.retweetData;
                const updatedRetweets = newRetweet.retweets;
    
                setRetweetCount(updatedRetweets);
    
                // ✅ Update global context
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

                // ✅ Ensure UI correctly updates retweets
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
                aria-label={`${hasRetweeted ? 'Undo Repost' : 'Repost'} post. Current reposts: ${retweetCount}`}
            >
                {loading ? "Processing..." : hasRetweeted ? `Undo Repost (${retweetCount})` : `Repost (${retweetCount})`}
            </button>
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
    onRetweetToggle: PropTypes.func, // ✅ Optional function to sync parent state
    setPosts: PropTypes.func.isRequired, // ✅ Required to propagate UI updates
};

export default RetweetButton;
