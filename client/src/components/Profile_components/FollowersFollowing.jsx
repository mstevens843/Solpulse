/**
 * FollowersFollowing.js
 * 
 * This file is responsible for displaying either the followers or following list for a given user.
 * It fetches the appropriate list based on the `type` prop and renders user cards.
 */

import React, { useState, useEffect, useRef } from "react";
import { api } from "@/api/apiConfig"; 
import UserCard from "@/components/Profile_components/UserCard"; 
import UserListItem from "@/components/Profile_components/UserListItem";
import "@/css/components/Profile_components/FollowersFollowing.css"; 

const cache = {}; // ✅ Simple in-memory cache

function FollowersFollowing({ userId, type, onClose, currentUserId }) {
  if (!onClose) {
    onClose = () => console.log("No onClose handler passed.");
  }

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryTrigger, setRetryTrigger] = useState(0); // ✅ To refetch on retry
  const [activeTab, setActiveTab] = useState(type); // 'followers' or 'following'

  const cacheKey = `${userId}-${activeTab}`;

  /**
   * Fetches followers or following based on type prop.
   * ✅ Uses cache if available.
   * ✅ Handles specific error messages.
   */
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");

      if (cache[cacheKey]) {
        setList(cache[cacheKey]);
        setLoading(false);
        return;
      }

      try {
        let response;
        if (activeTab === "followers") {
          response = await api.get(`/users/${userId}/followers`);
          cache[cacheKey] = response.data.followers || [];
        } else {
          response = await api.get(`/users/${userId}/following`);
          cache[cacheKey] = response.data.following || [];
        }

        setList(cache[cacheKey]);
      } catch (err) {
        console.error("Error fetching list:", err);
        if (!err.response) {
          setError("Network error. Please check your connection.");
        } else {
          setError("Failed to fetch list.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId, activeTab, cacheKey, retryTrigger]);

  const handleRetry = () => {
    setRetryTrigger((prev) => prev + 1);
  };

  return (
    <div className="followers-following-container">
      {/* Header */}
      <div className="ff-header">
        <button className="back-btn" onClick={onClose}>←</button>
        <div className="ff-tabs">
          <button
            className={activeTab === "followers" ? "active" : ""}
            onClick={() => setActiveTab("followers")}
          >
            Followers
          </button>
          <button
            className={activeTab === "following" ? "active" : ""}
            onClick={() => setActiveTab("following")}
          >
            Following
          </button>
        </div>
      </div>

      {/* Error Handling */}
      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button className="retry-btn" onClick={handleRetry}>Retry</button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="user-list">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton-card shimmer" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="empty-message">No {activeTab} yet.</p>
      ) : (
        <div className="user-list">
          {list.map((user) => (
            <UserListItem
              key={user.id}
              user={user}
              currentUserId={currentUserId}
              onClose={onClose}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default FollowersFollowing;

/**
 * Potential Improvements:
 * - Improve error messages by differentiating between network errors and empty lists.
 * - Implement a retry mechanism in case of network failures.
 * - Add a loading skeleton to improve UX while fetching data. 
 * - Cache the followers/following list to avoid redundant API calls.
 */
