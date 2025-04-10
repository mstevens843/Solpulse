/**
 * ActivityPage.js - User Activity Center (SolPulse)
 *
 * This page is responsible for:
 * - Displaying user messages and notifications in a tabbed interface.
 * - Allowing users to switch between "Messages" and "Notifications".
 * - Rendering the appropriate component (`MessagesInbox` or `NotificationsList`) based on the active tab.
 */



// ActivityPage.js

import React, { useEffect, useState } from "react";
import Messages from "@/components/Notification_components/Messages";
import NotificationsList from "@/components/Notification_components/NotificationsList";
import "@/css/pages/ActivityPage.css";

function ActivityPage() {
  const [activeTab, setActiveTab] = useState(() => {
    // 1️⃣ Persist selected tab from localStorage
    return localStorage.getItem("activeTab") || "messages";
  });

  // 1️⃣ Save to localStorage on tab change
  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  return (
    <div className="activity-page">
      <h2>Activity</h2>
      <div className="activity-tabs" role="tablist">
      <button
          className={`tab-button ${activeTab === "notifications" ? "active" : ""}`}
          onClick={() => setActiveTab("notifications")}
          aria-selected={activeTab === "notifications"}
          role="tab"
        >
          Notifications
        </button>
        <button
          className={`tab-button ${activeTab === "messages" ? "active" : ""}`}
          onClick={() => setActiveTab("messages")}
          aria-selected={activeTab === "messages"}
          role="tab"
        >
          Messages
        </button>
      </div>

      {/* 3️⃣ Add basic animation on tab switch */}
      <div className={`activity-content fade-in`}>
        {activeTab === "notifications" ? <NotificationsList /> : <Messages /> }
      </div>
    </div>
  );
}

export default ActivityPage;



/**
 * Potential Improvements:
 * - **Persist Selected Tab:** Store `activeTab` in localStorage or sessionStorage so it remains after page reloads.
 * - **Improve Accessibility:** Add `aria-selected` attributes to tabs for better screen reader support.
 * - **Add Animations:** Smooth transitions between tabs using CSS animations for better user experience.
 * - **Optimize Initial State:** Set the default active tab based on user preferences or unread counts. (skipped)
 */