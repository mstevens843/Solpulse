/**
 * FollowButton.js
 * 
 * This file is responsible for handling the follow/unfollow functionality for users.
 * It fetches the current follow status, toggles follow state on button click, and updates 
 * follower counts accordingly.
 */

import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { api } from "@/api/apiConfig";
import { toast } from "react-toastify";
import { FaUserPlus, FaUserCheck } from "react-icons/fa";
import "@/css/components/Profile_components/FollowButton.css";
import "react-toastify/dist/ReactToastify.css";

const followStatusCache = {}; // 🔁 In-memory follow status cache

const FollowButton = ({ userId, updateCounts, isFollowingYou = false, onFollowToggle }) => {
  const [isFollowing, setIsFollowing] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch follow status from backend if not cached
   */
  const fetchFollowStatus = useCallback(async () => {
    if (followStatusCache[userId] !== undefined) {
      setIsFollowing(followStatusCache[userId]);
      return;
    }

    try {
      const response = await api.get(`/users/${userId}/is-following`);
      const status = response.data.isFollowing;
      followStatusCache[userId] = status;
      setIsFollowing(status);
    } catch (error) {
      console.error("Error fetching follow status:", error);
      toast.error("Failed to load follow status.");
    }
  }, [userId]);

  useEffect(() => {
    fetchFollowStatus();
  }, [fetchFollowStatus]);

  /**
   * Toggle follow/unfollow logic (with optimistic UI).
   */
  const handleFollowToggle = async () => {
    if (loading || isFollowing === null) return;

    const newFollowState = !isFollowing;
    setIsFollowing(newFollowState);
    followStatusCache[userId] = newFollowState;

    if (onFollowToggle) onFollowToggle(newFollowState);
    if (updateCounts) updateCounts(newFollowState ? 1 : -1);

    setLoading(true);

    try {
      if (newFollowState) {
        await api.post(`/users/${userId}/follow`);
      } else {
        await api.delete(`/users/${userId}/unfollow`);
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
      toast.error("Failed to update follow status.");
      // Revert changes on error
      setIsFollowing(!newFollowState);
      followStatusCache[userId] = !newFollowState;
      if (updateCounts) updateCounts(newFollowState ? -1 : 1);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Button appearance logic
   */
  let buttonLabel = "Follow";
  let buttonClass = "follow";

  if (isFollowing) {
    buttonLabel = "Following";
    buttonClass = "following";
  } else if (isFollowingYou) {
    buttonLabel = "Follow Back";
    buttonClass = "follow-back";
  }

  return (
    <div className="follow-button-container">
      <button
        className={`follow-btn ${buttonClass}`}
        onClick={handleFollowToggle}
        disabled={loading || isFollowing === null}
        aria-label={buttonLabel}
      >
        {isFollowing ? <FaUserCheck /> : <FaUserPlus />}
        {` ${buttonLabel}`}
      </button>
    </div>
  );
};

FollowButton.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  updateCounts: PropTypes.func,
  isFollowingYou: PropTypes.bool, // 🔁 NEW!
  onFollowToggle: PropTypes.func,
};

export default FollowButton;


/**
 * Potential Improvements:
 * - Improve error handling by displaying error messages to users in a toast or notification. - SKIPPED
 * - Consider optimistic UI updates to reduce the delay in toggling follow state.
 * - Implement caching for follow status to reduce unnecessary API calls.
 */