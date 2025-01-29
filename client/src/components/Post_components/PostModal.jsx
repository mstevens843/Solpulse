import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import LikeButton from "@/components/Post_components/LikeButton";
import RetweetButton from "@/components/Post_components/RetweetButton";
import CommentSection from "@/components/Post_components/CommentSection";
import "@/css/components/Post_components/PostModal.css";

function PostModal({ post, onClose }) {
  return (
    <div className="post-modal-overlay" onClick={onClose}>
      <div className="post-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>
          ✖
        </button>
        <h2>{post.author}</h2>
        <p>{post.content}</p>

        {post.mediaUrl && (
          <img src={post.mediaUrl} alt="Post media" className="post-media" />
        )}

        <div className="post-actions">
          <LikeButton postId={post.id} initialLikes={post.likes || 0} />
          <RetweetButton postId={post.id} />
        </div>

        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}

PostModal.propTypes = {
  post: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PostModal;
