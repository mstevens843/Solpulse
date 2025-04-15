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
  const [cachedNotifications, setCachedNotifications] = useState([]); 
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showRead, setShowRead] = useState(false); 
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
        const data = response?.data || {};
        const fetched = data.notifications || [];
  
        console.log("📥 Notifications Fetched:", fetched);
  
        setNotifications(fetched);
        setCachedNotifications(fetched); 
        setUnreadCount(data.unreadCount ?? fetched.length); 
      } catch (error) {
        if (error.response?.status === 429) {
          console.warn("⚠️ Rate limit hit. Retry later.");
        } else {
          console.error("❌ Error fetching notifications:", error);
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
          console.log("✅ Using cached notifications");
          setNotifications(cachedNotifications);
        } else {
          console.log("📡 Fetching fresh notifications");
          fetchNotifications();
        }
      }
      return !prev;
    });
  };

  // closes dropdown when clicking outside. 
  const handleClickOutside = (event) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target) &&
      isDropdownOpen
    ) {
      setIsDropdownOpen(false);
    }
  };
  
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);



   /**
   * Marks all notifications as read.
   * - Optimistically updates the UI first.
   * - Sends an API request to update the server.
   */
   const markAllAsRead = async () => {
    try {
      // Optimistically update UI
      setNotifications([]);
      setUnreadCount(0);
  
      const response = await api.put("/notifications/mark-all-read");
  
      // Safely use returned unread count or default to 0
      const newUnreadCount = response?.data?.unreadCount ?? 0;
      setUnreadCount(newUnreadCount);
  
      console.log("✅ All notifications marked as read.");
    } catch (error) {
      console.error("❌ Error marking all notifications as read:", error);
    }
  };

  /**
   * Marks a single notification as read.
   * - Fades out the notification before removing it.
   */
  const markNotificationAsRead = async (id) => {
    try {
      const notifEl = document.getElementById(`notification-${id}`);
      if (notifEl) notifEl.classList.add("removed");
  
      setTimeout(async () => {
        const response = await api.put(`/notifications/${id}/read`);
  
        //  Remove from UI
        setNotifications((prev) => prev.filter((n) => n.id !== id));
  
        // Fallback if unreadCount not returned
        const newUnreadCount = response?.data?.unreadCount ?? 0;
        setUnreadCount(newUnreadCount);
  
        console.log(`✅ Notification ${id} marked as read.`);
      }, 300);
    } catch (error) {
      console.error(`❌ Error marking notification ${id} as read:`, error);
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
                .filter((n) => showRead || !n.isRead)
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