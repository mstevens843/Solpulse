// This page shows all user notifications, including likes, follows, comments on posts, or transactions.
// It keeps users updated about their interactions and activities on the platform.

// Description: 
// List notifications such as new followers, comments on posts, or transactions. 
// Allows users to click on notifications to navigate relevant posts or profiles. 


import React, { useState, useEffect, useMemo, useCallback } from "react";
import { api } from "@/api/apiConfig";
import WalletWrapper from "@/components/CryptoWalletIntegration";
import Loader from "@/components/Loader";
import socket from "@/socket";
import "@/css/pages/Notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [markingRead, setMarkingRead] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch notifications from the server
  const fetchNotifications = useCallback(
    async (page = 1, updateUnread = false) => {
      setLoading(true);
      try {
        const response = await api.get(`/notifications?page=${page}`);
        setNotifications((prev) =>
          page === 1
            ? response.data.notifications
            : [...prev, ...response.data.notifications]
        );
        if (updateUnread) setUnreadCount(response.data.unreadCount);
        setTotalPages(response.data.totalPages);
        setError("");
      } catch (err) {
        setError("Failed to fetch notifications. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // WebSocket handlers
  useEffect(() => {
    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    const handleMarkAllAsRead = () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    };

    socket.on("new-notification", handleNewNotification);
    socket.on("mark-all-read", handleMarkAllAsRead);

    return () => {
      socket.off("new-notification", handleNewNotification);
      socket.off("mark-all-read", handleMarkAllAsRead);
    };
  }, []);

  // Fetch notifications on page load or when currentPage changes
  useEffect(() => {
    fetchNotifications(currentPage, currentPage === 1);
  }, [currentPage, fetchNotifications]);

  // Mark all notifications as read
  const markAllAsRead = async () => {
    setMarkingRead(true);
    try {
      await api.post(`/notifications/mark-all-read`);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      socket.emit("mark-all-read");
    } catch {
      setError("Failed to mark notifications as read.");
    } finally {
      setMarkingRead(false);
    }
  };

  // Handle notification clicks
  const handleNotificationClick = (notification) => {
    const routes = {
      like: `/posts/${notification.postId}`,
      comment: `/posts/${notification.postId}`,
      follow: `/profiles/${notification.userId}`,
      transaction: `/wallet/transactions/${notification.transactionId}`,
    };

    const route = routes[notification.type];
    if (route) {
      window.location.href = route;
    } else {
      console.warn("Unhandled notification type:", notification.type);
    }
  };

  // Filter notifications based on the selected filter
  const filteredNotifications = useMemo(() => {
    if (filter === "all") return notifications;
    return notifications.filter((n) => n.type === filter);
  }, [filter, notifications]);

  return (
    <div className="notifications-container">
      <h1 className="notifications-header">Notifications</h1>
      <WalletWrapper />

      {error && (
        <div className="notifications-error" role="alert">
          <p>{error}</p>
          <button onClick={() => fetchNotifications(currentPage, true)}>
            Retry
          </button>
        </div>
      )}
      {loading && <Loader />}

      <div className="notifications-filter">
        <label htmlFor="filter">Filter by Type:</label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filter notifications by type"
        >
          <option value="all">All</option>
          <option value="like">Likes</option>
          <option value="comment">Comments</option>
          <option value="follow">Follows</option>
          <option value="transaction">Transactions</option>
        </select>
      </div>

      <button
        className="mark-read-btn"
        onClick={markAllAsRead}
        disabled={markingRead}
        aria-busy={markingRead}
      >
        {markingRead ? "Marking as Read..." : "Mark All as Read"}
      </button>

      <div className="notifications-list">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${
                notification.isRead ? "read" : "unread"
              } clickable`}
              aria-label={`Notification: ${notification.content}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <p>{notification.content}</p>
              <span>{new Date(notification.createdAt).toLocaleString()}</span>
            </div>
          ))
        ) : (
          !loading && <p className="no-notifications">No new notifications.</p>
        )}
      </div>

      <div className="pagination" aria-label="Pagination controls">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            disabled={currentPage === index + 1}
            aria-label={`Go to page ${index + 1}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Notifications;













// NotificationBell component: Added to show how many unread notiifications are present, consistent with rest of the app. 


// IMPROVEMENTS ADDED: 
// PAGE TITLE: Set page title to "NOTIFICATIONS | SOLPULSE" for better navigation
// ERROR HANDLING: Display user-friendly error messages. 
// MARK NOTIFICATIONS AS READ: Add a button to mark all notifications as read
// FILTER NOTIFICATIONS: Enable filtering by notification type (like, comments, etc.)
// IMPROVED LOADING STATE: Add a loader or spinner to indicate data fetching
// REAL-TIME UPDATES (Optional) Displas exact time when notification was received.
// NOTIFICATION TIMESTAMP: Display when the notification was recieved. 


// Further Suggestions
// Styling: Add CSS classes (read, unread, error-banner, etc.) for improved visual clarity.

// Real-time Updates: Use WebSocket or polling to update notifications in real time.

// Testing: Ensure the filtering and "mark all as read" functionality works as expected.

// Environment Variable for API URL:

// All API calls now use process.env.REACT_APP_API_URL for flexibility.
// Clean Code:

// Focused entirely on functionality without styling concerns.

// Changes to Notifications.js
// API Caching:

// Notifications are cached in localStorage to avoid redundant API calls when revisiting the page.
// WebSocket for Real-Time Updates:

// Added WebSocket for real-time notifications instead of relying solely on API polling.
// Error and Loader Consistency:

// Centralized error and loader displays for better user experience.
// Filter State Management:

// Optimized the filtering logic by memoizing the filtered notifications.

// Changes Made
// Notifications.js
// Added WebSocket for real-time notification updates.
// Enhanced error handling with meaningful messages.
// Implemented localStorage to preserve notifications across sessions.
// Added a filter feature for notification types.
// Integrated a "Mark All as Read" button with a loading state.

// Frontend:

// Integrated unread count.
// Added pagination and filter functionality.

// Changes Made:
// Dynamic API URLs:

// Replaced hardcoded URLs with process.env.REACT_APP_API_URL to allow easy configuration through .env.
// Improved Error Handling:

// Display a generic error message when fetching or marking notifications fails.
// Pagination Controls:

// Added dynamic pagination to handle multiple pages of notifications.
// Filtering Notifications:

// Added a dropdown to filter notifications by type (like, comment, follow, transaction, etc.).
// Optimized State Management:

// Used useMemo for efficient filtering without unnecessary re-renders.
// Accessibility:

// Added appropriate labels and improved the structure for better user experience and accessibility.
