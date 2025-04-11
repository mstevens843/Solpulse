/**
 * FollowButton.js
 * 
 * This file is responsible for handling the follow/unfollow functionality for users.
 * It fetches the current follow status, toggles follow state on button click, and updates 
 * follower counts accordingly.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { api } from "@/api/apiConfig";
import { toast } from "react-toastify";
import { FaUserPlus, FaUserCheck } from "react-icons/fa";
import "@/css/components/Profile_components/FollowButton.css";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/context/AuthContext";


const followStatusCache = {}; // { currentUserId: { [targetUserId]: true/false } }
// 🔁 In-memory follow status cache

const FollowButton = ({ userId, updateCounts, isFollowingYou = false, onFollowToggle, isMuted, setIsMuted, }) => {
  const { user: currentUser } = useAuth(); //  get logged-in user
  const [isFollowing, setIsFollowing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
  
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);


  useEffect(() => {
    const fetchMuteStatus = async () => {
      try {
        const res = await api.get(`/blocked-muted/mute/${userId}/status`);
        setIsMuted?.(res.data.isMuted);
      } catch (err) {
        console.error("Failed to fetch mute status:", err);
      }
    };
  
    fetchMuteStatus();
  }, [userId]);

  /**
   * Fetch follow status from backend if not cached
   */
  const fetchFollowStatus = useCallback(async () => {
    if (!currentUser?.id) return;
  
    const userCache = followStatusCache[currentUser.id] || {};
    if (userCache[userId] !== undefined) {
      setIsFollowing(userCache[userId]);
    }
  
    try {
      const [followRes, requestRes, userRes] = await Promise.all([
        api.get(`/users/${userId}/is-following`),
        api.get(`/follow-requests/${userId}/has-requested`), // ✅ FIXED ROUTE
        api.get(`/users/${userId}`),
      ]);
  
      const followStatus = followRes.data.isFollowing;
      const requestStatus = requestRes.data.hasRequested;
      const userPrivacy = userRes.data.privacy;
  
      setIsFollowing(followStatus);
      setHasRequested(requestStatus);
      setIsPrivate(userPrivacy === "private");
  
      followStatusCache[currentUser.id] = {
        ...userCache,
        [userId]: followStatus,
      };
    } catch (error) {
      console.error("Error fetching follow info:", error);
      toast.error("Failed to load follow status.");
    }
  }, [userId, currentUser?.id]);



  useEffect(() => {
    fetchFollowStatus();
  }, [fetchFollowStatus]);
  


  /**
   * Toggle follow/unfollow logic (with optimistic UI).
   */
  const handleFollowToggle = async () => {
    if (loading || isFollowing === null || !currentUser?.id) return;
    setLoading(true);
  
    try {
      if (isPrivate && !isFollowing) {
        if (hasRequested) {
          // ✅ Cancel follow request
          await api.delete(`/followRequests/${userId}/cancel`);
          toast.info("Follow request canceled.");
          setHasRequested(false);
        } else {
          // ✅ Send follow request
          await api.post(`/followRequests/${userId}`);
          toast.success("Follow request sent.");
          setHasRequested(true);
        }
        return;
      }
  
      // ✅ Normal public follow/unfollow flow
      if (isFollowing) {
        await api.delete(`/users/${userId}/unfollow`);
        setIsFollowing(false);
        followStatusCache[userId] = false;
        if (updateCounts) updateCounts(-1);
      } else {
        await api.post(`/users/${userId}/follow`);
        setIsFollowing(true);
        followStatusCache[userId] = true;
        if (updateCounts) updateCounts(1);
      }
  
      if (onFollowToggle) onFollowToggle(!isFollowing);
    } catch (error) {
      console.error("Error updating follow status:", error);
      toast.error("Follow action failed.");
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
  } else if (hasRequested) {
    buttonLabel = "Requested";
    buttonClass = "requested";
  } else if (isFollowingYou) {
    buttonLabel = "Follow Back";
    buttonClass = "follow-back";
  }

  return (
    <div className="follow-button-container" ref={dropdownRef}>
      <button
        className={`follow-btn ${buttonClass}`}
        onClick={(e) => {
          if (isFollowing) {
            e.stopPropagation();
            setShowDropdown((prev) => !prev);
          } else {
            handleFollowToggle();
          }
        }}
        disabled={loading || isFollowing === null}
        aria-label={buttonLabel}
        aria-pressed={isFollowing}
      >
        {isFollowing ? <FaUserCheck /> : <FaUserPlus />}
        {` ${buttonLabel}`} {isFollowing && <span className="dropdown-arrow">▼</span>}
      </button>
  
      {/* Dropdown options */}
      {isFollowing && showDropdown && (
        <div className="follow-dropdown">
          <button
            className="dropdown-item unfollow"
            onClick={async () => {
              try {
                await api.delete(`/users/${userId}/unfollow`);
                setIsFollowing(false);
                followStatusCache[userId] = false;
                if (updateCounts) updateCounts(-1);
                if (onFollowToggle) onFollowToggle(false);
                toast.success("Unfollowed successfully.");
              } catch (err) {
                console.error("Unfollow error:", err);
                toast.error("Failed to unfollow.");
              }
              setShowDropdown(false);
            }}
          >
            Unfollow
          </button>

          <button
            className="dropdown-item"
            onClick={async () => {
              try {
                console.log("📡 Mute request sent to:", isMuted ? "DELETE" : "POST");
                if (isMuted) {
                  await api.delete(`/blocked-muted/mute/${userId}`); // ✅ Corrected DELETE
                  toast.success("User unmuted.");
                  setIsMuted?.(false); // ✅ only calls if defined
                } else {
                  await api.post(`/blocked-muted/mute/${userId}`); // ✅ Corrected POST
                  toast.success("User muted.");
                  setIsMuted?.(true);  // ✅ safe and clean
                }
              } catch (err) {
                console.error("Mute/unmute error:", err);
                toast.error("Failed to update mute status.");
              }
              setShowDropdown(false);
            }}
          >
            {isMuted ? "Unmute" : "Mute"}
          </button>
        </div>
      )}
    </div>
  );
}

FollowButton.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  updateCounts: PropTypes.func,
  isFollowingYou: PropTypes.bool, // 🔁 NEW!
  onFollowToggle: PropTypes.func,
  isMuted: PropTypes.bool,
  setIsMuted: PropTypes.func,
};

export default FollowButton;


/**
 * Potential Improvements:
 * - Improve error handling by displaying error messages to users in a toast or notification. - SKIPPED
 * - Consider optimistic UI updates to reduce the delay in toggling follow state.
 * - Implement caching for follow status to reduce unnecessary API calls.
 */