import React, { useState, useContext } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import LikeButton from "@/components/Post_components/Actions/LikeButton";
import RetweetButton from "@/components/Post_components/Actions/RetweetButton";
import CommentModal from "@/components/Post_components/Modals/CommentModal";
import { AuthContext } from "@/context/AuthContext";
import "@/css/components/Post_components/Modals/ExploreModal.css";

function ExploreModal({ post, onClose, currentUser, setPosts }) {
  const [isCommentModalOpen, setCommentModalOpen] = useState(false);
  const { blockedUserIds = [], mutedUserIds = [] } = useContext(AuthContext);

  if (!post) return null;

  const postUserId = post?.user?.id || post?.userId || post?.originalUserId;

if (blockedUserIds.includes(postUserId)) {
  return (
    <div className="explore-modal-overlay" onClick={onClose}>
      <div className="explore-modal-content locked" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>✖</button>
        <div className="text-center py-8 text-red-500 dark:text-red-400">
          🚫 You have blocked this user. Post hidden.
        </div>
      </div>
    </div>
  );
}

if (mutedUserIds.includes(postUserId)) {
  return null; // Silently ignore muted posts
}

  // Privacy Lock Logic
  const author = post.user || post.originalPost?.user || {};
  const isPrivate = author.privacy === "private";
  const isOwner = author.id === currentUser?.id;
  const isFollower = author.isFollowedByCurrentUser;

  const isRepostOfPrivate =
    post.originalPost?.user?.privacy === "private" &&
    post.originalPost?.user?.id !== currentUser?.id &&
    !post.originalPost?.user?.isFollowedByCurrentUser;

  const isLocked = (isPrivate && !isOwner && !isFollower) || isRepostOfPrivate;

  if (isLocked) {
    return (
      <div className="explore-modal-overlay" onClick={onClose}>
        <div className="explore-modal-content locked" onClick={(e) => e.stopPropagation()}>
          <button className="close-modal-btn" onClick={onClose}>✖</button>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto mb-3 h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m0-6a2 2 0 00-2 2v2h4v-2a2 2 0 00-2-2zm0-4a4 4 0 00-4 4v2h8v-2a4 4 0 00-4-4z"
              />
            </svg>
            <p className="text-lg font-semibold">This post is from a private account</p>
            <p className="text-sm">You must follow them to view it.</p>
          </div>
        </div>
      </div>
    );
  }

  const postIdToUse = post.isRetweet ? post.originalPostId : post.id;

  const resolvedAvatarUrl = post.profilePicture?.startsWith("http")
    ? post.profilePicture
    : post.profilePicture
    ? `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}${post.profilePicture}`
    : "/uploads/default-avatar.png";

  const postAuthor = post.isRetweet && post.originalAuthor
    ? post.originalAuthor
    : post.author || "Unknown";

  return (
    <div className="explore-modal-overlay" onClick={onClose}>
  <div className="explore-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>✖</button>

        {/* Post Header */}
        <div className="post-modal-header">
          <Link to={`/profile/${post.userId}`}>
            <img
              src={resolvedAvatarUrl}
              alt="Author avatar"
              className="post-author-avatar"
            />
          </Link>
          <div className="post-author-info">
            <Link to={`/profile/${post.userId}`}>
              <span className="post-author-name">{postAuthor}</span>
            </Link>
            <span className="post-timestamp">
              {post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}
            </span>
          </div>
        </div>

        {/* Post Content */}
        <p className="post-content">{post.content}</p>

        {post.mediaUrl && (
          post.mediaUrl.endsWith(".mp4") ? (
            <video controls className="post-media">
              <source src={post.mediaUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img src={post.mediaUrl} alt="Post media" className="post-media" />
          )
        )}

        {/* Actions */}
        <div className="post-actions">
          <LikeButton
            postId={postIdToUse}
            initialLikes={post.likes}
            currentUser={currentUser}
            setPosts={setPosts}
          />
          <RetweetButton
            postId={postIdToUse}
            initialRetweets={post.retweets}
            currentUser={currentUser}
            setPosts={setPosts}
          />
        </div>

        {/* View/Add Comments */}
        <div className="view-comments-link">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCommentModalOpen(true);
            }}
            className="view-comments-link"
          >
            View/Add Comments ({post.commentCount || 0})
          </a>
        </div>

        {/* Reuse CommentModal */}
        {isCommentModalOpen && (
          <CommentModal
            post={post}
            onClose={() => setCommentModalOpen(false)}
            likedPosts={new Set()} // Optional: pass down real ones if needed
            retweetedPosts={new Set()}
            currentUser={currentUser}
            setPosts={setPosts}
          />
        )}
      </div>
    </div>
  );
}

ExploreModal.propTypes = {
  post: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  currentUser: PropTypes.object.isRequired,
  setPosts: PropTypes.func.isRequired,
};

export default ExploreModal;
