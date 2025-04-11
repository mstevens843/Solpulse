import React, { useState, useEffect } from "react";
import { api } from "@/api/apiConfig";
import UserListItem from "@/components/Profile_components/UserListItem";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import "@/css/components/Post_components/Modals/PostInteractionsModal.css";

function PostInteractionsModal({ postId, isOpen, onClose, defaultTab = "likes", currentUserId }) {
  if (!isOpen) return null;
  if (!onClose) onClose = () => console.log("No onClose handler passed.");

  const [activeTab, setActiveTab] = useState(defaultTab); // "likes" or "reposts"
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryTrigger, setRetryTrigger] = useState(0);
  const { blockedUserIds = [], mutedUserIds = [] } = useContext(AuthContext);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");

      try {
        const res = await api.get(`/posts/${postId}/interactions`);
        const data = res.data;

        setList(activeTab === "likes" ? data.likes : data.reposts);
      } catch (err) {
        console.error(err);
        setError("Failed to load interactions.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [postId, activeTab, retryTrigger]);

  const handleRetry = () => {
    setRetryTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    setActiveTab(defaultTab); // 🔄 Reset internal state when defaultTab changes
  }, [defaultTab]);

  return (
    <div className="interactions-modal">
      <div className="interactions-header">
        <button className="back-btn" onClick={onClose}>←</button>
        <div className="interactions-tabs">
          <button
            className={activeTab === "likes" ? "active" : ""}
            onClick={() => setActiveTab("likes")}
          >
            Likes
          </button>
          <button
            className={activeTab === "reposts" ? "active" : ""}
            onClick={() => setActiveTab("reposts")}
          >
            Reposts
          </button>
        </div>
      </div>

      {error && (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={handleRetry}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="user-list">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton-card shimmer" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="empty-message">No {activeTab} yet.</p>
      ) : (
        <div className="user-list">
          {list
          .filter((user) => !blockedUserIds.includes(user.id) && !mutedUserIds.includes(user.id))
          .map((user) => (
            <UserListItem
              key={user.id}
              user={user}
              currentUserId={currentUserId}
              onClose={onClose}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default PostInteractionsModal;
