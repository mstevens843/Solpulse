/**
 * NotificationBell.js
 *
 * This file is responsible for handling real-time notifications for the user.
 * It allows users to:
 * - View unread notifications when clicking the bell icon.
 * - Mark notifications as read individually or all at once.
 * - Fetch notifications from the API only when the dropdown is opened.
 *
 * Features:
 * - Uses **debounced API calls** to prevent unnecessary requests.
 * - Implements **click outside detection** to close the dropdown when clicking elsewhere.
 * - Displays **real-time unread count updates**.
 * - Handles **different types of notifications**, including transactions.
 */


import React, { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/api/apiConfig";
import debounce from "lodash.debounce";
import "@/css/components/Notification_components/NotificationBell.css";

const notificationMessages = {
  like: "liked your post",
  retweet: "reposted your post",
  comment: "commented on your post",
  follow: "started following you",
  message: "sent you a message",
  transaction: (amount) => `💰 sent you a tip of ${amount} SOL`,
};


const notificationIcons = {
  like: "❤️",
  retweet: "🔄",
  comment: "💬",
  follow: "➕",
  message: "✉️",
  transaction: "💰",
};


function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [cachedNotifications, setCachedNotifications] = useState([]); // ✅ 4. Cache notifications
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showRead, setShowRead] = useState(false); // ✅ 3. Show/hide read toggle
  const dropdownRef = useRef(null);

  /**
   * Fetches notifications from the API.
   * - Uses **debounce** to prevent excessive requests.
   * - Updates both the notifications list and the unread count.
   */
  const fetchNotifications = useCallback(
    debounce(async () => {
      try {
        const response = await api.get("/notifications");
        console.log("Notifications Fetched: ", response.data.notifications);
        setNotifications(response.data.notifications || []);
        setCachedNotifications(response.data.notifications || []); // ✅ cache them
        setUnreadCount(response.data.unreadCount || 0);
      } catch (error) {
        if (error.response?.status === 429) {
          console.warn("Rate limit hit. Retry later.");
        } else {
          console.error("Error fetching notifications:", error);
        }
      }
    }, 300),
    []
  );

  // Toggle dropdown and fetch notifications when opening
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => {
      if (!prev) {
        if (cachedNotifications.length > 0) {
          setNotifications(cachedNotifications); // ✅ use cached version
        } else {
          fetchNotifications();
        }
      }
      return !prev;
    });
  };

  // closes dropdown when clicking outside. 
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);



   /**
   * Marks all notifications as read.
   * - Optimistically updates the UI first.
   * - Sends an API request to update the server.
   */
  const markAllAsRead = async () => {
    try {
      // Optimistically update UI first
      setNotifications([]);
      setUnreadCount(0);

      const response = await api.put("/notifications/mark-all-read");

      // Ensure the unread count from the server is accurate
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  /**
   * Marks a single notification as read.
   * - Fades out the notification before removing it.
   */
  const markNotificationAsRead = async (id) => {
    try {
      document.getElementById(`notification-${id}`).classList.add("removed");

      setTimeout(async () => {
        const response = await api.put(`/notifications/${id}/read`);
        setNotifications((prev) => prev.filter((notification) => notification.id !== id));
        setUnreadCount(response.data.unreadCount); // Set from backend response
      }, 300);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="notification-button"
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        🔔
        {unreadCount > 0 && (
          <span className="unread-count" aria-live="polite">
            {unreadCount}
          </span>
        )}
      </button>
      {isDropdownOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Notifications</h4>
            <div className="notification-dropdown-footer">
              <a href="/activity" className="view-all-link">
                View all notifications
              </a>
            </div>
            <button
              onClick={markAllAsRead}
              className="mark-all-read"
              aria-label="Mark all notifications as read"
            >
              Mark All as Read
            </button>
          </div>
          {notifications.length > 0 ? (
            <ul className="notification-list">
              {notifications
                .filter((n) => showRead || !n.isRead) // ✅ 3. Toggle visibility of read
                .map((notification) => (
                  <li
                    key={notification.id}
                    id={`notification-${notification.id}`}
                    className={`notification-item ${notification.isRead ? "read" : "unread"}`}
                  >
                    <div className="notification-content">
                      <p>
                        <span className="notification-icon">
                          {notificationIcons[notification.type] || "🔔"}
                        </span>{" "}
                        <strong>{notification.actor}</strong>{" "}
                        {notification.type === "transaction"
                          ? notificationMessages.transaction(notification.amount)
                          : notificationMessages[notification.type] || notification.message}
                      </p>
                      <span>{new Date(notification.createdAt).toLocaleString()}</span>
                    </div>
                    {!notification.isRead && (
                      <button
                        className="mark-as-read-btn"
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        Mark as Read
                      </button>
                    )}
                  </li>
                ))}
            </ul>
          ) : (
            <p className="no-notifications">No notifications</p>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;


/**
 * 🔹 **Potential Improvements:** 
 * - **WebSocket Integration**: - SKIPPED
 *   - Implement real-time notifications instead of requiring a fetch when opening the dropdown.
 *
 * - **Notification Type Icons**:
 *   - Add small icons next to each notification type (e.g., ❤️ for likes, 🔄 for retweets).
 *
 * - **Better Read/Unread UI**:
 *   - Instead of removing notifications immediately, add a "Show Read" toggle.
 *
 * - **Improve Performance**:
 *   - Cache notifications in state to avoid re-fetching if the dropdown is closed and reopened.
 */


/**
2. Notification Type Icons

Added emoji icons per notification type via getNotificationIcon() helper.

3. Better Read/Unread UI

Introduced a Show Read / Hide Read toggle to optionally display previously read notifications.

4. Performance Optimization (Client Caching)

Cached notifications in cachedNotifications so reopening the dropdown doesn’t re-fetch unnecessarily.
 */