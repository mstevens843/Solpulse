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
import { useNavigate } from "react-router-dom";
import FollowButton from "@/components/Profile_components/FollowButton";
import "@/css/components/Profile_components/UserListItem.css";

function UserListItem({ user, currentUserId }) {
  const navigate = useNavigate();
  const defaultAvatar = "http://localhost:5001/uploads/default-avatar.png";

  const profilePicUrl = user.profilePicture
    ? `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}${user.profilePicture}`
    : defaultAvatar;

  const handleClick = () => {
    navigate(`/profile/${user.id}`);
  };

  // ✅ Local state for tracking if you're following them
  const [isFollowing, setIsFollowing] = useState(user.isFollowedByCurrentUser ?? false);

  // ✅ Update follow state when toggled
  const handleFollowToggle = (newState) => {
    setIsFollowing(newState);
  };

  return (
    <div className="user-list-item" onClick={handleClick}>
      <img
        src={`${profilePicUrl}?t=${new Date().getTime()}`}
        alt={`${user.username}'s profile`}
        className="user-list-avatar"
        onClick={(e) => e.stopPropagation()}
      />

      <div className="user-list-info">
        <div className="user-list-username">@{user.username}</div>
        {user.bio && <div className="user-list-bio">{user.bio}</div>}
      </div>

      {user.id !== currentUserId && (
        <div
          className="user-list-follow-btn"
          onClick={(e) => e.stopPropagation()}
        >
          <FollowButton
            userId={user.id}
            isFollowingYou={user.isFollowingYou} // ✅ Do they follow you?
            onFollowToggle={handleFollowToggle}  // ✅ You toggled follow?
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
    isFollowingYou: PropTypes.bool, // ✅ Needed for 3-state logic
  }).isRequired,
  currentUserId: PropTypes.number.isRequired,
};

export default UserListItem;