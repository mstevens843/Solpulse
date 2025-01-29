import React, { useState } from "react";
import MessagesInbox from "@/components/Notification_components/MessagesInbox";
import NotificationsList from "@/components/Notification_components/NotificationsList";
import "@/css/pages/ActivityPage.css";

function ActivityPage() {
  const [activeTab, setActiveTab] = useState("messages");

  return (
    <div className="activity-page">
      <h2>Activity</h2>
      <div className="activity-tabs">
        <button className={activeTab === "messages" ? "active" : ""} onClick={() => setActiveTab("messages")}>
          Messages
        </button>
        <button className={activeTab === "notifications" ? "active" : ""} onClick={() => setActiveTab("notifications")}>
          Notifications
        </button>
      </div>

      <div className="activity-content">
        {activeTab === "messages" ? <MessagesInbox /> : <NotificationsList />}
      </div>
    </div>
  );
}

export default ActivityPage;
