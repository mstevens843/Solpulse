// NotificationBell component provides a user-friendly interface for managing and displaying notifications
// Includes:
// NOTIFICATION ICON: 
// - Displays a bell icon with a dynamic count of unread notiications
// - Updates the count in real-time based on the data fetched from the backend. 

// DROPDOWN MENU:
// - Displays a dropdown with a list of notifications when the bell icon is clicked. 
// - Each notification includes (a message, timestamp when it was created)

// DYNAMIC DATA FETCHING: 
// - Fetches notifications and unread counts from an API (/api/notifications) using 'axios'

// TOGGLE INTERACTION:
// - Allows users to toggle the visibility of the dropdown by clicking the bell icon. 

// FALLBACK STATE: 
// - Shows a "No notifications" message if there are no notifications available


import React, { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/api/apiConfig";
import debounce from "lodash.debounce";
import "@/css/components/Notification_components/NotificationBell.css";

const notificationMessages = {
  like: "liked your post",
  comment: "commented on your post",
  follow: "started following you",
  message: "sent you a message",
  transaction: "sent you a tip",
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

//   const markAllAsRead = async () => {
//     try {
//       await api.post("/notifications/mark-all-read");
  
//       // Remove all notifications from state immediately
//       setNotifications([]);
      
//       // Set unread count to zero
//       setUnreadCount(0);
//     } catch (error) {
//       console.error("Error marking all notifications as read:", error);
//     }
//   };

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
                      {notificationMessages[notification.type] || notification.message}
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









// PAGES where NotificationBell Component is implemented: 
// NavBar Component
// Dashboard Page
// Home Page


// Potential for Reuse: 
// PROFILE PAGE: 
// Could be included on the profile page to notify users about interactions specific to their profile (new followers, likes, comments)
// MESSAGING PAGE:
// Can alert users to new message notifications, complementing the MessagePreview or DirectMessages components.

// Improvements Made: 
// Dropdown Close on Outside Click: Implement functionality to close dropdown
// Mark Notifications as Read: Add functionality when dropdown is opened or when individual notifications are clicked. 
// Performance: Avoid re-rendering dropdown unnecessarily by memoizing. Add lazy loading for notifications if there is large list.
// Accessibility: add 'aria-label' and 'aria-live' to improve accessibility for screen readers. 

// NotificationBell.js
// Debouncing:

// Used lodash.debounce to limit the frequency of the fetchNotifications function call, reducing unnecessary API requests during component lifecycle changes.
// Event Listener Cleanup:

// Added cleanup to the event listener for mousedown to avoid memory leaks.
// State Updates:

// Optimized markAllAsRead by directly modifying the state for notifications instead of redundant mapping.

// Key Updates
// Component (NotificationBell.js)
// Server Interaction:

// Added a POST request to mark all notifications as read.
// Dynamic Accessibility:

// Used aria-live="polite" for unread count updates.
// Added aria-label for buttons.
// Error Handling:

// Wrapped critical actions (like marking notifications as read) in try-catch blocks.

// Changes and Improvements:
// Environment Variable Consistency:

// All API calls now use ${process.env.REACT_APP_API_URL} to ensure consistency across components.
// Error Handling:

// Added checks for empty data from the API (response.data.notifications || [] and response.data.unreadCount || 0).
// Debounce for Efficiency:

// Debounced the fetchNotifications function to reduce redundant API calls.
// Clean-Up Logic:

// Improved cleanup for event listeners to prevent memory leaks.
// Styling and Accessibility:

// Added aria-label for the notification bell and count for screen reader support.
// Used aria-live="polite" to announce updates to the unread count without interrupting the user.