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

const notificationMessages = {
  like: "liked your post",
  retweet: "reposted your post",
  comment: "commented on your post",
  follow: "started following you",
  message: "sent you a message",
  transaction: (amount) => `💰 sent you a tip of ${amount} SOL`,
};

const notificationTypes = ["likes", "retweets", "comments", "follows", "messages", "tips", "all"];

function NotificationsList() {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState([]); // ✅ #3 Bulk Actions: track selected notifications
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("likes");
  const [sortOption, setSortOption] = useState("newest"); // ✅ #2 Custom Sorting: track selected sort


  useEffect(() => {
    fetchNotifications("likes"); // Load likes by default
  }, []);



  /**
   * Fetches notifications based on the selected category.
   * - Uses dynamic endpoints for different notification types.
   * - Resets the notification list before each fetch.
   */
  const fetchNotifications = async (type) => {
    setLoading(true);
    setError("");
    setNotifications([]); // Clear notifications before fetching new ones

    let endpoint;
    switch (type) {
      case "likes":
        endpoint = "/posts/likes";
        break;
        case "retweets":
          endpoint = "/posts/retweets";
          break;
        
      case "comments":
        endpoint = "/comments/detailed?page=1";
        break;
      case "follows":
        endpoint = "/users/followers/notifications?page=1";
        break;
      case "messages":
        endpoint = "/messages/detailed?page=1&limit=10";
        break;
      case "tips":
        endpoint = "/notifications/tips";
        break;
      default:
        endpoint = "/notifications";
    }

    try {
      const response = await api.get(endpoint);
      setNotifications(
        type === "likes"
          ? response.data.likes.map((item) => ({
              id: item.postId,
              actor: item.likedBy || `User unknown`,
              message: `${item.likedBy} liked your post`,
              content: item.content,
              createdAt: item.createdAt,
              isRead: false,
            }))
          : type === "retweets"
            ? response.data.retweets.map((item) => ({
                id: item.postId,  // Use postId from API response
                actor: item.retweetedBy || "Unknown",  // Use correct actor field
                message: `${item.retweetedBy} reposted your post`,  // Ensure correct message
                content: item.content || "No content", 
                createdAt: item.createdAt,
                isRead: false,  // No isRead field in retweets, default to false
              }))
          : type === "comments"
          ? response.data.comments.map((item) => ({
              id: item.id,
              actor: item.author || `User ${item.userId}`,
              message: `${item.author} commented on your post`,
              content: item.content,
              createdAt: item.createdAt,
              isRead: false,
            }))
          : type === "follows"
          ? response.data.followers.map((item) => ({
              id: item.id,
              actor: item.actor,
              message: `${item.actor} started following you`,
              content: null,
              createdAt: item.createdAt,
              isRead: false,
            }))
          : type === "messages"
          ? response.data.messages.map((item) => ({
              id: item.id,
              actor: item.sender || `User unknown`,
              message: `${item.sender} sent you a message`,
              content: item.content,
              createdAt: item.createdAt,
              isRead: item.read || false,
            }))
          : type === "tips"
          ? response.data.tips.map((item) => ({
              id: item.id,
              actor: item.actor|| `User unknown`,
              message: notificationMessages.transaction(item.amount),
              content: item.content,
              createdAt: item.createdAt,
              isRead: item.isRead || false,
            }))
            : response.data.notifications.map((item) => ({
              id: item.id,
              actor: item.actor || `User unknown`,
              profilePicture: item.profilePicture || null, // ✅ Optional for later display
              message: item.message,
              content: item.content || null,
              createdAt: item.createdAt,
              isRead: item.isRead || false,
          }))
      );
    } catch (err) {
      setError("Failed to fetch notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  /**
   * Marks a specific notification as read.
   * - Uses a fade-out effect before removing the notification.
   */
  const markNotificationAsRead = async (id) => {
    try {
      document.getElementById(`notification-${id}`).classList.add("removed");

      setTimeout(async () => {
        await api.put(`/notifications/${id}/read`);
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== id)
        );
      }, 300);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      setError("Failed to mark notification as read.");
    }
  };

  /**
   * Marks all notifications as read.
   * - Clears the notification list after marking all as read.
   */
  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/mark-all-read");
      setNotifications([]); // Clear the list after marking all as read
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      setError("Failed to mark all notifications as read.");
    }
  };

  const markSelectedAsRead = async () => {
    try {
      await Promise.all(
        selectedNotifications.map((id) => api.put(`/notifications/${id}/read`)) // ✅ #3 Bulk Actions: batch read
      );
      setNotifications((prev) => prev.filter((n) => !selectedNotifications.includes(n.id)));
      setSelectedNotifications([]);
    } catch (err) {
      console.error("Failed to mark selected as read:", err);
      setError("Some notifications failed to be marked as read.");
    }
  };


  /**
   * Refactored Sorting to make it expandable for the future. 
   */
  const sortedNotifications = [...notifications]
  .filter((n) => (sortOption === "unread" ? !n.isRead : true)) // Optional filter
  .sort((a, b) => {
    switch (sortOption) {
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "unread":
        return new Date(b.createdAt) - new Date(a.createdAt); // Keep newest order after filter
      default:
        return 0;
    }
  });


  return (
    <div className="notifications-page-container">
      <h2 className="notifications-page-header">Notifications</h2>
  
      <div className="notifications-tabs">
        {notificationTypes.map((type) => (
          <button
            key={type}
            className={`notifications-tab ${activeTab === type ? "active" : ""}`}
            onClick={() => {
              setActiveTab(type);
              fetchNotifications(type);
            }}
          >
            {type === "all"
              ? "All"
              : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
  
      <div className="notifications-controls">
        <button className="notifications-action-btn" onClick={markAllAsRead}>
          Mark All as Read
        </button>
  
        {selectedNotifications.length > 0 && (
          <button className="notifications-action-btn" onClick={markSelectedAsRead}>
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
          {/* <option value="type">Group by Type</option> // future enhancement */}
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
              className={`notifications-card ${notification.isRead ? "read" : "unread"}`}
            >
              <input
                type="checkbox"
                checked={selectedNotifications.includes(notification.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedNotifications((prev) => [...prev, notification.id]);
                  } else {
                    setSelectedNotifications((prev) =>
                      prev.filter((id) => id !== notification.id)
                    );
                  }
                }}
              />
  
              <div className="notification-content">
                <p>
                  <strong>{notification.actor}</strong> {notification.message}
                </p>
  
                {notification.content && (
                  <p className="notification-extra-content">"{notification.content}"</p>
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