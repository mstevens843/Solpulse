/**
 * LikeButton Component
 *
 * This component allows users to like/unlike posts.
 * - Uses local state (`likes`, `hasLiked`) to track like count and user interaction.
 * - Updates global liked posts in `AuthContext` for persistent UI consistency.
 * - Calls API to update like status in the backend.
 *
 * Features:
 * - Prevents multiple like/unlike requests using `loading` state.
 * - Stores liked posts in `sessionStorage` for quick retrieval.
 * - Supports `setPosts` to update the parent feed without refetching.
 */


import React, { useState, useContext, useRef } from "react";
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

  const debounceRef = useRef(null); // ✅ debounce ref

  const handleLikeToggle = async () => {
    if (loading || !currentUser?.id) {
      if (!currentUser?.id) setError("You need to log in to like posts.");
      return;
    }

    // ✅ Debounce rapid clicks
    if (debounceRef.current) return;
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
    }, 600);

    // ✅ Optimistic UI update
    const previousLikes = likes;
    const previousHasLiked = hasLiked;
    const optimisticLike = !hasLiked;
    const optimisticLikes = optimisticLike ? likes + 1 : likes - 1;

    setLikes(optimisticLikes);
    setHasLiked(optimisticLike);
    setLoading(true);
    setError("");

    try {
      const response = await api.post(`/posts/${actualPostId}/like`, { userId: currentUser.id });
      setLikes(response.data.likes);
      setHasLiked(response.data.hasLiked);

      setLikedPosts((prev) => {
        const updated = new Set(prev);
        response.data.hasLiked ? updated.add(actualPostId) : updated.delete(actualPostId);
        sessionStorage.setItem("likedPosts", JSON.stringify([...updated]));
        return updated;
      });

      if (onLikeToggle) onLikeToggle(actualPostId, response.data.likes);

      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === actualPostId || p.originalPostId === actualPostId
            ? { ...p, likes: response.data.likes }
            : p
        )
      );
    } catch (err) {
      console.error("Error liking/unliking post:", err);
      setError("Failed to update like status. Please try again.");

      // ❌ Rollback optimistic UI
      setLikes(previousLikes);
      setHasLiked(previousHasLiked);
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
        aria-label={`${hasLiked ? "Unlike" : "Like"} post. Current likes: ${likes}`}
        aria-pressed={hasLiked}
      >
        {loading ? "..." : hasLiked ? `❤️ ${likes}` : `🤍 ${likes}`}
      </button>

      {/* ✅ Screen reader live update */}
      <span className="visually-hidden" aria-live="polite">
        {hasLiked ? "Post liked." : "Post unliked."}
      </span>

      {/* ✅ Friendly error with retry */}
      {error && (
        <div className="like-error" role="alert" aria-live="assertive">
          <p>{error}</p>
          <button onClick={handleLikeToggle} disabled={loading} className="retry-like-btn">
            Retry
          </button>
        </div>
      )}
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
  setPosts: PropTypes.func, // Now optional with default empty function
};

export default LikeButton;


/**
 * Potential Improvements:
 * 1. **Optimize Performance:** - SKIPPED
 *    - Instead of calling `api.post()` every time, debounce the function to reduce network requests.
 *    - Implement optimistic UI updates (assume success, then rollback on error).
 *
 * 2. **Improve Error Handling:**
 *    - Display user-friendly error messages instead of setting raw text in `setError`.
 *    - Implement retry logic in case of temporary server issues.
 *
 * 3. **Enhance Accessibility:**
 *    - Use visually distinct styles for liked/unliked states.
 *    - Add aria-live announcements for screen readers.
 */