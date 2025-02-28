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

const notificationTypes = ["likes", "retweets", "comments", "follows", "messages", "tips", "notifications"];

function NotificationsList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("likes");

  useEffect(() => {
    fetchNotifications("likes"); // Load likes by default
  }, []);

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
          : response.data.notifications || []
      );
    } catch (err) {
      setError("Failed to fetch notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/mark-all-read");
      setNotifications([]); // Clear the list after marking all as read
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      setError("Failed to mark all notifications as read.");
    }
  };

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
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <button className="notifications-page-mark-all-btn" onClick={markAllAsRead}>
        Mark All as Read
      </button>

      {error && <p className="notifications-page-error">{error}</p>}
      {loading ? (
        <Loader />
      ) : notifications.length > 0 ? (
        <ul className="notifications-page-list">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              id={`notification-${notification.id}`}
              className={`notifications-card ${notification.isRead ? "read" : "unread"}`}
            >
              <div className="notification-icon">
                {notification.type === "like" && "❤️"}
                {notification.type === "retweet" && "🔁"}
                {notification.type === "comment" && "💬"}
                {notification.type === "follow" && "➕"}
                {notification.type === "message" && "✉️"}
                {notification.type === "transaction" && "💰"}
              </div>

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