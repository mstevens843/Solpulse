import React, { useState, useEffect, useCallback } from "react";
import { api } from "@/api/apiConfig";
import Loader from "@/components/Loader";
import "@/css/pages/Notifications.css";

const notificationMessages = {
  like: "liked your post",
  comment: "commented on your post",
  follow: "started following you",
  message: "sent you a message",
  transaction: "sent you a tip",
};

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data.notifications || []);
    } catch (err) {
      setError("Failed to fetch notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="notifications-page-container">
      <h2 className="notifications-page-header">Notifications</h2>
      {error && <p className="notifications-page-error">{error}</p>}
      {loading ? (
        <Loader />
      ) : notifications.length > 0 ? (
        <ul className="notifications-page-list">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`notifications-page-item ${notification.isRead ? "read" : "unread"}`}
            >
              <p>
                <strong>{notification.actor}</strong> {notificationMessages[notification.type] || notification.message}
              </p>
              <span className="notifications-page-time">
                {new Date(notification.createdAt).toLocaleString()}
              </span>
              <button
                className="notifications-page-mark-read-btn"
                onClick={() => console.log("Marked as read")}
              >
                Mark as Read
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="notifications-page-no-notifications">No notifications yet.</p>
      )}
    </div>
  );
}

export default NotificationsPage;
