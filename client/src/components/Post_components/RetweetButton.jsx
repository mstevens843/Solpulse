import React, { useState } from "react";
import PropTypes from "prop-types";
import "@/css/components/Post_components/PostButtons.css"; 
import { api } from "@/api/apiConfig"; 
import { toast } from "react-toastify";

function RetweetButton({ postId, initialRetweets = 0, currentUser, onRetweet, createdAt }) {
    const [retweetCount, setRetweetCount] = useState(initialRetweets);
    const [hasRetweeted, setHasRetweeted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRetweet = async () => {
        if (loading || hasRetweeted || !currentUser?.id) {
            if (!currentUser?.id) toast.error("You need to log in to retweet posts.");
            return;
        }
    
        setLoading(true);
        try {
            const response = await api.post(`/posts/${postId}/retweet`, { userId: currentUser.id });
            
            // Update retweet count immediately in UI
            setRetweetCount((prev) => prev + 1);
            setHasRetweeted(true);

            // Notify parent component to update the posts feed
            onRetweet((prevPosts) => [
                {
                    id: response.data.retweetData.id,
                    userId: response.data.retweetData.userId,
                    author: response.data.retweetData.originalAuthor,
                    profilePicture: response.data.retweetData.originalProfilePicture,
                    content: response.data.retweetData.content,
                    mediaUrl: response.data.retweetData.mediaUrl,
                    cryptoTag: response.data.retweetData.cryptoTag,
                    likes: response.data.retweetData.likes,
                    retweets: response.data.retweetData.retweets,
                    isRetweet: true,
                    originalPostId: postId,
                    originalAuthor: response.data.retweetData.originalAuthor,
                    originalProfilePicture: response.data.retweetData.originalProfilePicture,
                    createdAt: response.data.retweetData.createdAt,
                },
                ...prevPosts,
            ]);

            toast.success("Post retweeted successfully!");
        } catch (err) {
            console.error("Error retweeting post:", err);
            toast.error("Failed to retweet the post.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="retweet-button-container">
            <button
                onClick={handleRetweet}
                disabled={loading || hasRetweeted}
                className="retweet-button"
                aria-label={`Repost post. Current reposts: ${retweetCount}`}
            >
                {loading ? "Reposting..." : `Repost (${retweetCount})`}
            </button>
        </div>
    );
};

RetweetButton.propTypes = {
    postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    initialRetweets: PropTypes.number,
    currentUser: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        username: PropTypes.string.isRequired,
    }).isRequired,
    onRetweet: PropTypes.func.isRequired,
};

export default RetweetButton;