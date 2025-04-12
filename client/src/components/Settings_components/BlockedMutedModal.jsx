import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "@/css/components/Settings_components/BlockedMutedModal.css"; // Create a basic style file
import { api } from "@/api/apiConfig";
import UserListItem from "@/components/Profile_components/UserListItem";

function BlockedMutedModal({ currentUserId, onClose }) {
  const [activeTab, setActiveTab] = useState("blocked");
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [mutedUsers, setMutedUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [blockedRes, mutedRes] = await Promise.all([
          api.get("/blocked-muted/block"),
          api.get("/blocked-muted/mute"),
        ]);
        setBlockedUsers(blockedRes.data || []);
        setMutedUsers(mutedRes.data || []);
      } catch (err) {
        console.error("❌ Failed to load blocked/muted users", err);
      }
    };
    fetchUsers();
  }, []);

  const handleUnblock = async (userId) => {
    try {
      await api.delete(`/blocked-muted/block/${userId}`);
      setBlockedUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error("❌ Failed to unblock", err);
    }
  };

  const handleUnmute = async (userId) => {
    try {
      await api.delete(`/blocked-muted/mute/${userId}`);
      setMutedUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error("❌ Failed to unmute", err);
    }
  };

  const renderList = (users, isMutedList = false) => {
    if (!users.length) {
      return (
        <p className="empty-state">
          {isMutedList ? "You haven’t muted anyone yet." : "You haven’t blocked anyone yet."}
        </p>
      );
    }

    return users.map((user) => (
      <UserListItem
        key={user.id}
        user={user}
        currentUserId={currentUserId}
        isMuted={isMutedList}
        customAction={
          <button
            className={`un-${isMutedList ? "mute" : "block"}-btn`}
            onClick={(e) => {
              e.stopPropagation();
              isMutedList ? handleUnmute(user.id) : handleUnblock(user.id);
            }}
          >
            {isMutedList ? "Unmute" : "Unblock"}
          </button>
        }
      />
    ));
  };

  return (
    <div className="blocked-muted-modal-overlay" onClick={onClose}>
      <div className="blocked-muted-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Blocked & Muted Users</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="tab-selector">
          <button
            className={activeTab === "blocked" ? "active" : ""}
            onClick={() => setActiveTab("blocked")}
          >
            Blocked
          </button>
          <button
            className={activeTab === "muted" ? "active" : ""}
            onClick={() => setActiveTab("muted")}
          >
            Muted
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "blocked"
            ? renderList(blockedUsers, false)
            : renderList(mutedUsers, true)}
        </div>
      </div>
    </div>
  );
}

BlockedMutedModal.propTypes = {
  currentUserId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BlockedMutedModal;
