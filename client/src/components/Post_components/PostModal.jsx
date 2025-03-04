import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { api } from "@/api/apiConfig";
import LikeButton from "@/components/Post_components/LikeButton";
import RetweetButton from "@/components/Post_components/RetweetButton";
import CommentSection from "@/components/Post_components/CommentSection";
import socket from "@/socket";
import "@/css/components/Post_components/PostModal.css";

function PostModal({ post, onClose, likedPosts, retweetedPosts, currentUser, setPosts }) { // Ensure setPosts is passed
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(post.likes || 0);
  const [retweets, setRetweets] = useState(post.retweets || 0);
  const postIdToUse = post.isRetweet ? post.originalPostId : post.id;

  // Fetch comments for original posts & retweets
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await api.get(`/comments?postId=${postIdToUse}`);
        setComments(response.data.comments);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      }
    };

    fetchComments();
  }, [postIdToUse]);

  // WebSocket Listener for New Comments
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

  // Ensure likes update globally inside the modal
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

  // Ensure retweets update globally inside the modal
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

        <CommentSection postId={postIdToUse} onNewComment={(newComment) => setComments((prev) => [newComment, ...prev])} /> 

        <div className="post-comments">
          {comments?.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="comment">
                <strong>{comment.author}</strong>
                <p>{comment.content}</p>
              </div>
            ))
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
