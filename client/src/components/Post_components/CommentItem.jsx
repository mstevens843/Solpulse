import React from "react";
import PropTypes from "prop-types";
import { formatDistanceToNow } from "date-fns";
import "@/css/components/Post_components/CommentItem.css";

function CommentItem({ author, avatarUrl, content, createdAt }) {
  return (
    <li className="comment-item">
      <img
        src={avatarUrl || "http://localhost:5001/uploads/default-avatar.png"}
        alt={`${author}'s avatar`}
        className="comment-avatar"
      />
      <div className="comment-body">
        <div className="comment-header">
          <span className="comment-author">{author}</span>
          <span className="comment-time">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
        </div>
        <p className="comment-content">{content}</p>
      </div>
    </li>
  );
}

CommentItem.propTypes = {
  author: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  content: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
};

export default CommentItem;
