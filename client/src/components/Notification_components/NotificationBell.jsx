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

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications only when triggered by button click
  const fetchNotifications = useCallback(
    debounce(async () => {
      try {
        const response = await api.get("/notifications");
        console.log("Notifications Fetched: ", response.data.notifications);
        setNotifications(response.data.notifications || []);
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
        fetchNotifications();
      }
      return !prev;
    });
  };

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

  // Mark a single notification as read and remove it
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
            {notifications.map((notification) => (
              <li
                key={notification.id}
                id={`notification-${notification.id}`}
                className={`notification-item ${notification.isRead ? "read" : "unread"}`}
              >
                <div className="notification-content">
                  <p>
                    <strong>{notification.actor}</strong>{" "}
                    {notification.type === "transaction"
                      ? notificationMessages.transaction(notification.amount)
                      : notificationMessages[notification.type] || notification.message}
                  </p>
                  <span>{new Date(notification.createdAt).toLocaleString()}</span>
                </div>
                <button
                  className="mark-as-read-btn"
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  Mark as Read
                </button>
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
