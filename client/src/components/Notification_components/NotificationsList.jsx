/**
 * NotificationsList.js
 *
 * This file is responsible for displaying a categorized list of user notifications.
 * It allows users to:
 * - View notifications filtered by type (likes, retweets, comments, follows, messages, tips).
 * - Mark notifications as read individually or all at once.
 * - Fetch detailed notifications using different API endpoints based on category.
 *
 * Features:
 * - **Dynamic Tab Navigation:** Users can switch between different notification types.
 * - **Optimized API Calls:** Clears previous notifications before fetching new ones to prevent stale data.
 * - **Mark Read Functionality:** Allows marking individual notifications or all notifications as read.
 * - **Icons for Different Notification Types:** Adds visual clarity for different actions.
 */



import React, { useState, useEffect } from "react";
import { api } from "@/api/apiConfig";
import Loader from "@/components/Loader";
import "@/css/components/Notification_components/NotificationsList.css";

const notificationTypes = ["likes", "retweets", "comments", "follows", "messages", "tips", "all"];

function NotificationsList() {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("likes");
  const [sortOption, setSortOption] = useState("newest");

  useEffect(() => {
    fetchNotifications();
  }, []);

  /**
   * Fetch all notifications (detailed) from /notifications/full
   */
  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/notifications/full");
      setNotifications(response.data.notifications);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mark an individual notification as read
   */
  const markNotificationAsRead = async (id) => {
    try {
      // Fade-out effect
      document.getElementById(`notification-${id}`).classList.add("removed");
      setTimeout(async () => {
        await api.put(`/notifications/${id}/read`);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 300);
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError("Failed to mark notification as read.");
    }
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/mark-all-read");
      // Clear them locally
      setNotifications([]);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      setError("Failed to mark all notifications as read.");
    }
  };

  /**
   * Bulk mark selected notifications as read
   */
  const markSelectedAsRead = async () => {
    try {
      await Promise.all(
        selectedNotifications.map((id) => api.put(`/notifications/${id}/read`))
      );
      setNotifications((prev) => prev.filter((n) => !selectedNotifications.includes(n.id)));
      setSelectedNotifications([]);
    } catch (err) {
      console.error("Failed to mark selected as read:", err);
      setError("Some notifications failed to be marked as read.");
    }
  };

  /**
   * Filter notifications by the active tab (like, comment, etc.)
   */
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "likes") return n.type === "like";
    if (activeTab === "retweets") return n.type === "retweet";
    if (activeTab === "comments") return n.type === "comment";
    if (activeTab === "follows") return n.type === "follow";
    if (activeTab === "messages") return n.type === "message";
    if (activeTab === "tips") return n.type === "transaction";
    return false;
  });

  /**
   * Sort the filtered list by 'newest', 'oldest', or 'unread'
   */
  const sortedNotifications = [...filteredNotifications]
    .filter((n) => (sortOption === "unread" ? !n.isRead : true))
    .sort((a, b) => {
      if (sortOption === "newest" || sortOption === "unread") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortOption === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      return 0;
    });

  return (
    <div className="notifications-page-container">
      <h2 className="notifications-page-header">Notifications</h2>

      <div className="notifications-tabs">
        {notificationTypes.map((type) => (
          <button
            key={type}
            className={`notifications-tab ${activeTab === type ? "active" : ""}`}
            onClick={() => setActiveTab(type)}
          >
            {type === "all"
              ? "All"
              : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div className="notifications-controls">
        <button onClick={markAllAsRead} className="notifications-action-btn">
          Mark All as Read
        </button>

        {selectedNotifications.length > 0 && (
          <button onClick={markSelectedAsRead} className="notifications-action-btn">
            Mark Selected as Read
          </button>
        )}

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="notification-sort-dropdown"
        >
          <option value="newest">Sort by Newest</option>
          <option value="oldest">Sort by Oldest</option>
          <option value="unread">Sort by Unread</option>
        </select>
      </div>

      {error && <p className="notifications-page-error">{error}</p>}

      {loading ? (
        <Loader />
      ) : sortedNotifications.length > 0 ? (
        <ul className="notifications-page-list">
          {sortedNotifications.map((notification) => (
            <li
              key={notification.id}
              id={`notification-${notification.id}`}
              className={`notifications-card ${
                notification.isRead ? "read" : "unread"
              }`}
            >
              {/* Bulk-select checkbox */}
              <input
                type="checkbox"
                checked={selectedNotifications.includes(notification.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedNotifications((prev) => [...prev, notification.id]);
                  } else {
                    setSelectedNotifications((prev) =>
                      prev.filter((selectedId) => selectedId !== notification.id)
                    );
                  }
                }}
              />

              <div className="notification-content">
                {/* The backend includes the username inside notification.message */}
                <p>{notification.message}</p>

                {notification.content && (
                  <p className="notification-extra-content">
                    "{notification.content}"
                  </p>
                )}
                <span className="notification-time">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>

              {!notification.isRead && (
                <button
                  className="notification-mark-read-btn"
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  Mark as Read
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="notifications-page-no-notifications">No notifications yet.</p>
      )}
    </div>
  );
}

export default NotificationsList;



/**
 * 🔹 **Potential Improvements:**
 * - **WebSocket Integration**: Implement real-time notifications instead of relying on API fetch. - SKIPPED
 * - **Custom Sorting**: Allow users to sort notifications by date, type, or read status.
 * - **Bulk Actions**: Enable users to delete or archive multiple notifications at once.
 */