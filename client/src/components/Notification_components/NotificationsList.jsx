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


  // useEffect(() => {
  //   fetchNotifications("likes"); // Load likes by default
  // }, []);

  useEffect(() => {
    const storedTab = localStorage.getItem("activeNotificationTab") || "likes";
    setActiveTab(storedTab);
    fetchNotifications(storedTab);
  }, []);
  
  const handleTabClick = (type) => {
    setActiveTab(type);
    localStorage.setItem("activeNotificationTab", type);
    fetchNotifications(type);
  };


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
          try {
            const [followersRes, requestsRes] = await Promise.all([
              api.get("/users/followers/notifications?page=1"),
              api.get("/follow-requests/incoming"),
            ]);
        
            const actualFollows = followersRes.data.followers.map((item) => ({
              id: item.notificationId || item.id,
              actor: item.actor || "User unknown",
              message: item.message || "started following you",
              profilePicture: item.profilePicture || null,
              content: null,
              createdAt: item.createdAt,
              isRead: item.isRead || false,
              type: "follow",
            }));
        
            const incomingRequests = requestsRes.data.requests.map((item) => ({
              id: item.id,
              actor: item.requesterUser?.username || "Unknown user",
              profilePicture: item.requesterUser?.profilePicture || null,
              message: "requested to follow you",
              createdAt: item.createdAt,
              isRead: false,
              type: "follow-request",
            }));
        
            setNotifications([...incomingRequests, ...actualFollows]);
          } catch (err) {
            console.error("Error fetching follows + requests:", err);
            setError("Failed to fetch follow notifications.");
          }
          break;
      case "messages":
        try {
          const [messagesRes, requestsRes] = await Promise.all([
            api.get("/messages/detailed?page=1&limit=10"),
            api.get("/message-requests/incoming"), // 👈 new endpoint
          ]);
      
          const realMessages = messagesRes.data.messages
            .filter((item) => item.notificationId !== null)
            .map((item) => ({
              id: item.notificationId,
              actor: item.sender || `User unknown`,
              message: `${item.sender} sent you a message`,
              profilePicture: item.profilePicture || null,
              content: item.content,
              createdAt: item.createdAt,
              isRead: item.isRead || false,
              type: "message",
            }));
      
          const messageRequests = requestsRes.data.requests.map((item) => ({
            id: item.id,
            actor: item.senderUser?.username || "Unknown user",
            profilePicture: item.senderUser?.profilePicture || null,
            message: "sent you a message request",
            content: item.content,
            createdAt: item.createdAt,
            isRead: false,
            type: "message-request",
          }));
      
          setNotifications([...messageRequests, ...realMessages]);
        } catch (err) {
          console.error("Error fetching messages + requests:", err);
          setError("Failed to fetch messages.");
        }
        break;
      case "tips":
        endpoint = "/notifications/tips";
        break;
      default:
        endpoint = "/notifications";
    }

    try {
      const response = await api.get(endpoint);
      console.log("Notifications fetched:", response.data);

       // ✅ Add debug log only for retweets
    if (type === "retweets") {
      console.log("🔥 Retweet data raw:", response.data.retweets);
    }

      setNotifications(
        type === "likes"
          ? response.data.likes.map((item) => ({
              id: item.notificationId || item.id, // ✅ Use real notification ID
              actor: item.likedBy || `User unknown`,
              message: `${item.likedBy} liked your post`,
              profilePicture: item.profilePicture || null, // ✅ frontend can now use this
              content: item.content,
              createdAt: item.createdAt,
              isRead: item.isRead || false, // ✅ ← Use real isRead if it exists
            }))
          : type === "retweets"
            ? response.data.retweets.map((item) => ({
                id: item.notificationId || item.id, // ✅ Use real notification ID
                actor: item.retweetedBy || "Unknown",  // Use correct actor field
                message: `${item.retweetedBy} reposted your post`,  // Ensure correct message
                profilePicture: item.profilePicture || null, // ✅ frontend can now use this
                content: item.content || "No content", 
                createdAt: item.createdAt,
                isRead: false,  // No isRead field in retweets, default to false
              }))
              : type === "comments"
              ? response.data.comments.map((item) => ({
                  id: item.notificationId || item.id, // Match likes/retweets
                  actor: item.actor || `User unknown`,
                  message: item.message || "commented on your post",
                  profilePicture: item.profilePicture || null, // ✅ frontend can now use this
                  content: item.content || null,
                  createdAt: item.createdAt,
                  isRead: item.isRead || false,
                }))
            
                : type === "follows"
                ? response.data.followers.map((item) => ({
                    id: item.notificationId || item.id,  // Use real notification ID
                    actor: item.actor || "User unknown",  // Ensure correct actor
                    message: item.message || "started following you",  // Default follow message
                    profilePicture: item.profilePicture || null, // ✅ frontend can now use this
                    content: null,  // Follows don't need extra content
                    createdAt: item.createdAt,
                    isRead: item.isRead || false,  // Use real isRead field if it exists
                }))
                            
                : type === "messages"
                ? response.data.messages
                    .filter((item) => item.notificationId !== null) // ✅ Only include ones with notificationId
                    .map((item) => ({
                      id: item.notificationId,
                      actor: item.sender || `User unknown`,
                      message: `${item.sender} sent you a message`,
                      profilePicture: item.profilePicture || null, // ✅ frontend can now use this
                      content: item.content,
                      createdAt: item.createdAt,
                      isRead: item.isRead || false,
                    })) 
                    : type === "tips"
                    ? response.data.tips.map((item) => ({
                        id: item.id,
                        actor: item.actor || `User unknown`,
                        message: notificationMessages.transaction(item.amount),
                        profilePicture: item.profilePicture || null, // ✅ frontend can now use this

                        content: item.content,
                        createdAt: item.createdAt,
                        isRead: false, // ✅ Always false now
                      }))
                  : response.data.notifications.map((item) => ({
                    id: item.id,
                    actor: item.actor || `User unknown`,
                    profilePicture: item.profilePicture || null,
                    message: item.message,
                    content: item.content || null,
                    createdAt: item.createdAt,
                    isRead: false, // ✅ always false because backend filters only unread
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
      document.getElementById(`notification-${id}`)?.classList.add("removed");
  
      setTimeout(async () => {
        await api.put(`/notifications/${id}/read`);
        setNotifications((prev) => prev.filter((n) => n.id !== id)); // ✅ remove from UI
      }, 300);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      setError("Failed to mark notification as read.");
    }
  };

  /**
   * Marks all notifications from respective tab as read. 
   * - Clears the notification list for respective category after marking all as read.
   */
  const markTabAsRead = async () => {
    try {
      // Make a new endpoint or filter IDs by type
      const idsToMark = notifications.map((n) => n.id);
  
      await Promise.all(idsToMark.map((id) => api.put(`/notifications/${id}/read`)));
      setNotifications([]);
    } catch (err) {
      console.error("Error marking tab as read:", err);
      setError("Failed to mark tab notifications as read.");
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
            onClick={() => handleTabClick(type)}
          >
            {type === "all"
              ? "All"
              : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
  
      <div className="notifications-controls">
        {activeTab === "all" ? (
          <button className="notifications-action-btn" onClick={markAllAsRead}>
            Mark All as Read
          </button>
        ) : (
          <button className="notifications-action-btn" onClick={markTabAsRead}>
            Mark All as Read
          </button>
        )}
  
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
  
              <img
                src={
                  notification.profilePicture?.startsWith("http")
                    ? notification.profilePicture
                    : notification.profilePicture
                    ? `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}${notification.profilePicture}`
                    : "/uploads/default-avatar.png"
                }
                alt={`${notification.actor}'s avatar`}
                className="notification-avatar"
              />
  
            <div className="notification-content">
              <p className="notification-message">
                <strong>{notification.actor}</strong>{" "}
                {notification.message.replace(`${notification.actor} `, "")}
              </p>

              {notification.content && (
                <p className="notification-tip-message">💬 "{notification.content}"</p>
              )}

              <span className="notification-time">
                {new Date(notification.createdAt).toLocaleString()}
              </span>
              {notification.type === "follow-request" && (
              <div className="follow-request-actions">
                <button
                  className="accept-btn"
                  onClick={async () => {
                    try {
                      await api.put(`/follow-requests/${notification.id}/accept`);
                      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
                    } catch (err) {
                      console.error("Failed to accept follow request:", err);
                    }
                  }}
                >
                  Accept
                </button>
                <button
                  className="deny-btn"
                  onClick={async () => {
                    try {
                      await api.delete(`/follow-requests/${notification.id}/deny`);
                      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
                    } catch (err) {
                      console.error("Failed to deny follow request:", err);
                    }
                  }}
                >
                  Deny
                </button>
              </div>
            )}
            {notification.type === "message-request" && (
            <div className="follow-request-actions">
              <button
                className="accept-btn"
                onClick={async () => {
                  try {
                    await api.put(`/message-requests/${notification.id}/accept`);
                    setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
                  } catch (err) {
                    console.error("Failed to accept message request:", err);
                  }
                }}
              >
                Accept
              </button>
              <button
                className="deny-btn"
                onClick={async () => {
                  try {
                    await api.delete(`/message-requests/${notification.id}/deny`);
                    setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
                  } catch (err) {
                    console.error("Failed to deny message request:", err);
                  }
                }}
              >
                Deny
              </button>
            </div>
          )}
          </div>
  
              {notification.isRead ? (
                <span className="notification-read-indicator">✓ Read</span>
              ) : (
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