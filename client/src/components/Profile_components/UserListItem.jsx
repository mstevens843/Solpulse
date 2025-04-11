/**
 * Purpose:
A lightweight, responsive component used in the Followers/Following modal. It mimics social platform behavior (e.g. Instagram, Twitter), displaying:
Profile picture
Username
Bio
Contextual follow button (Follow, Following, Follow Back)
Optional Message or Tip buttons (if needed later)
 */

// UserListItem.js

import React, { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate, Link } from "react-router-dom";
import FollowButton from "@/components/Profile_components/FollowButton";
import "@/css/components/Profile_components/UserListItem.css";

function UserListItem({ user, currentUserId, showBio = false, isMuted = false }) {
  const navigate = useNavigate();
  const defaultAvatar = "http://localhost:5001/uploads/default-avatar.png";

  const profilePicUrl = user.profilePicture
    ? `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}${user.profilePicture}`
    : defaultAvatar;

  const handleClick = () => {
    navigate(`/profile/${user.id}`);
  };

  // Track whether currentUser is following this user
  const [isFollowing, setIsFollowing] = useState(
    user.isFollowedByCurrentUser ?? false
  );

  const [hasRequested, setHasRequested] = useState(false);


  const handleFollowToggle = (newState) => {
    setIsFollowing(newState);
  };

  const handleRequestToggle = (newRequestState) => {
    setHasRequested(newRequestState);
  };

  return (
    <div
      className={`user-list-item ${isMuted ? "muted-user" : ""}`}
      onClick={!isMuted ? handleClick : undefined} // disable click if muted
    >
      {/* ✅ Profile picture links to user profile */}
      <Link
        to={`/profile/${user.id}`}
        onClick={(e) => e.stopPropagation()}
        className="user-list-avatar-link"
      >
        <img
          src={`${profilePicUrl}?t=${new Date().getTime()}`}
          alt={`${user.username}'s profile`}
          className="user-list-avatar"
        />
      </Link>

      <div className="user-list-info">
        <div className="user-list-username">@{user.username}
        {hasRequested && <span className="request-badge">Requested</span>}</div>
        {/* Only show the bio if showBio is true and the user has a bio */}
        {showBio && user.bio && (
          <div className="user-list-bio">{user.bio}</div>
        )}
      </div>

      {/* Don't show follow button if it's the same user */}
      {user.id !== currentUserId && (
        <div
          className="user-list-follow-btn"
          onClick={(e) => e.stopPropagation()}
        >
          <FollowButton
            userId={user.id}
            isFollowingYou={user.isFollowingYou}
            onFollowToggle={handleFollowToggle}
            onRequestToggle={handleRequestToggle}
          />

        </div>
      )}
    </div>
  );
}

UserListItem.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    profilePicture: PropTypes.string,
    bio: PropTypes.string,
    isFollowedByCurrentUser: PropTypes.bool,
    isFollowingYou: PropTypes.bool,
  }).isRequired,
  currentUserId: PropTypes.number,
  showBio: PropTypes.bool, // <-- new optional prop
  isMuted: PropTypes.bool,
};

export default UserListItem;
