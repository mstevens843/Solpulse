import React, { useState } from "react";
import PropTypes from "prop-types";
import { api } from "@/api/apiConfig"; 
import "@/css/components/Post_components/PostButtons.css";

function LikeButton({ postId, initialLikes = 0, currentUser }) {
    const [likes, setLikes] = useState(initialLikes);
    const [hasLiked, setHasLiked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLike = async () => {
        if (loading || hasLiked || !currentUser?.id) {
            if (!currentUser?.id) setError("You need to log in to like posts.");
            return;
        }
        setLoading(true);
        setError("");

        try {
            const response = await api.post(`/posts/${postId}/like`, { userId: currentUser.id });
            setLikes(response.data.likes);
            setHasLiked(true); 
        } catch (err) {
            console.error("Error liking post:", err);
            setError("Failed to like the post. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="like-button-container">
            <button
                onClick={handleLike}
                disabled={loading || hasLiked}
                className="like-button"
                aria-label={`Like post. Current likes: ${likes}`}
            >
                {loading ? "Liking..." : `Like (${likes})`}
            </button>
            {error && <p className="like-error" role="alert">{error}</p>}
        </div>
    );
}

LikeButton.propTypes = {
    postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    initialLikes: PropTypes.number,
    currentUser: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }).isRequired,
};

export default LikeButton;