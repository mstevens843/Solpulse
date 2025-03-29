/**
 * PostModal Component
 *
 * This modal displays a single post with:
 * - **Full post content, including media (if available).**
 * - **Live comment updates via WebSockets.**
 * - **Like & Retweet functionality, synced globally.**
 * - **Ensures post state updates across the app.**
 */


import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { api } from "@/api/apiConfig";
import LikeButton from "@/components/Post_components/LikeButton";
import RetweetButton from "@/components/Post_components/RetweetButton";
import CommentSection from "@/components/Post_components/CommentSection";
import CommentItem from "@/components/Post_components/CommentItem";
import socket from "@/socket";
import "@/css/components/Post_components/PostModal.css";

function PostModal({ post, onClose, likedPosts, retweetedPosts, currentUser, setPosts }) { // Ensure setPosts is passed
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(post.likes || 0);
  const [loading, setLoading] = useState(true); // ✅ Loading state added
  const [retweets, setRetweets] = useState(post.retweets || 0);
  const postIdToUse = post.isRetweet ? post.originalPostId : post.id;

  /**
     * Fetch comments for original posts & retweets.
     * Ensures proper loading of all relevant comments.
     */
  /** ✅ Fetch comments and show loading until done */
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await api.get(`/comments?postId=${postIdToUse}`);
        setComments(response.data.comments);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        setLoading(false); // ✅ Stop loading once request finishes
      }
    };

    fetchComments();
  }, [postIdToUse]);

  /**
     * WebSocket Listener for New Comments
     * - Listens for new comments in real time.
     * - Ensures comments update live without refreshing.
     */
  useEffect(() => {
    const handleNewComment = (newComment) => {
      if (newComment.postId === postIdToUse) {
        setComments((prev) => [newComment, ...prev]);
      }
    };

    socket.off("new-comment").on("new-comment", handleNewComment);

    return () => {
      socket.off("new-comment", handleNewComment);
    };
  }, [postIdToUse]);

  // Ensure likes update globally inside the modal, whenever user likes/unlikes a post. 
  const handleLikeToggle = (postId, updatedLikes) => {
    setLikes(updatedLikes);
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p.id === postId || p.originalPostId === postId
          ? { ...p, likes: updatedLikes }
          : p
      )
    );
  };

  // Ensure retweets update globally inside the modal, whenever a user retweets/undos a retweet.
  const handleRetweetToggle = (postId, isReposting, updatedRetweets, newRetweetData) => {
    setRetweets(updatedRetweets);
    setPosts((prevPosts) => {
      let updatedPosts = prevPosts.map((p) =>
        p.id === postId || p.originalPostId === postId
          ? { ...p, retweets: updatedRetweets }
          : p
      );

      if (isReposting && newRetweetData) {
        updatedPosts = [newRetweetData, ...updatedPosts]; // Add retweet to feed
      }

      return updatedPosts;
    });
  };

  return (
    <div className="post-modal-overlay" onClick={onClose}>
      <div className="post-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>✖</button>
        <h2>{post.author || "Unknown Author"}</h2> 
        <p>{post.content}</p>

        {post.mediaUrl && (
          <img src={post.mediaUrl} alt="Post media" className="post-media" />
        )}

        {/* Updated Like & Retweet Buttons */}
        <div className="post-actions">
          <LikeButton 
            postId={postIdToUse} 
            initialLikes={likes}
            likedPosts={likedPosts}
            currentUser={currentUser}
            onLikeToggle={handleLikeToggle} // Ensure likes sync inside the modal
            setPosts={setPosts} // Pass setPosts for global updates
          />
          <RetweetButton 
            postId={postIdToUse} 
            initialRetweets={retweets}
            retweetedPosts={retweetedPosts}
            currentUser={currentUser}
            onRetweetToggle={handleRetweetToggle} // Ensure retweets sync inside the modal
            setPosts={setPosts} // Pass setPosts for global updates
          />
        </div>

        <CommentSection
          postId={postIdToUse}
          originalPostId={post.originalPostId}
          onNewComment={(newComment) => setComments((prev) => [newComment, ...prev])}
          setPosts={setPosts}
        />


        <div className="post-comments">
          {loading ? (
            <p className="loading-comments">Loading comments...</p>
          ) : comments.length > 0 ? (
            <ul className="comment-list">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  author={comment.author || "Unknown"}
                  avatarUrl={comment.avatarUrl}
                  content={comment.content}
                  createdAt={comment.createdAt}
                />
              ))}
            </ul>
          ) : (
            <p>No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}


PostModal.propTypes = {
  post: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  likedPosts: PropTypes.instanceOf(Set),
  retweetedPosts: PropTypes.instanceOf(Set),
  currentUser: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }),
  setPosts: PropTypes.func.isRequired, // Ensures updates propagate across state
};

export default PostModal;

/**
 * 🔹 **Potential Improvements:**
 * 1. **Optimize WebSocket Handling**: Ensure listeners don’t persist across multiple modals. - SKIPPED
 * 2. **Add Loading States**: Show a loading indicator while fetching comments.
 * 3. **Support Video Previews**: Improve handling of video media. - SKIPPED
 * 4. **Enable Live Likes/Retweets**: Use WebSockets to update likes/retweets in real time. - SKIPPED 
 */

/**
 * Future Polish Ideas:
 * Replace Loading comments... with a spinner or animation for smoother UX.
 */