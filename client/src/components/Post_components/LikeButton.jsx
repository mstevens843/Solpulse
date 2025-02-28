import React, { useState, useContext } from "react";
import PropTypes from "prop-types";
import { api } from "@/api/apiConfig"; 
import { AuthContext } from "@/context/AuthContext"; 
import "@/css/components/Post_components/PostButtons.css";

function LikeButton({ postId, originalPostId, initialLikes = 0, currentUser, onLikeToggle, setPosts = () => {} }) {
    const { likedPosts, setLikedPosts } = useContext(AuthContext); 
    const [likes, setLikes] = useState(initialLikes);
    const [hasLiked, setHasLiked] = useState(likedPosts.has(originalPostId || postId)); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const actualPostId = originalPostId || postId;

    const handleLikeToggle = async () => {
        if (loading || !currentUser?.id) {
            if (!currentUser?.id) setError("You need to log in to like posts.");
            return;
        }
        setLoading(true);
        setError("");

        try {
            const response = await api.post(`/posts/${actualPostId}/like`, { userId: currentUser.id });
            setLikes(response.data.likes);
            setHasLiked((prev) => !prev);

            setLikedPosts((prev) => {
                const updated = new Set(prev);
                hasLiked ? updated.delete(actualPostId) : updated.add(actualPostId);
                sessionStorage.setItem("likedPosts", JSON.stringify([...updated]));
                return updated;
            });

            if (onLikeToggle) onLikeToggle(actualPostId, response.data.likes);

            if (setPosts) { // ✅ Only update if `setPosts` is provided
                setPosts((prevPosts) =>
                    prevPosts.map((p) =>
                        p.id === actualPostId || p.originalPostId === actualPostId
                            ? { ...p, likes: response.data.likes }
                            : p
                    )
                );
            }
        } catch (err) {
            console.error("Error liking/unliking post:", err);
            setError("Failed to update like status.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="like-button-container">
            <button
                onClick={handleLikeToggle}
                disabled={loading}
                className={`like-button ${hasLiked ? "liked" : ""}`}
                aria-label={`${hasLiked ? 'Unlike' : 'Like'} post. Current likes: ${likes}`}
            >
                {loading ? "Processing..." : hasLiked ? `Unlike (${likes})` : `Like (${likes})`}
            </button>
            {error && <p className="like-error" role="alert">{error}</p>}
        </div>
    );
}

LikeButton.propTypes = {
    postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    originalPostId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    initialLikes: PropTypes.number,
    currentUser: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }).isRequired,
    onLikeToggle: PropTypes.func, 
    setPosts: PropTypes.func, // ✅ Now optional with default empty function
};

export default LikeButton;
