import React, { useState, useEffect } from "react";
import { api } from "@/api/apiConfig";
import Loader from "@/components/Loader";
import "@/css/pages/Settings.css";
import { FaEnvelope, FaLock, FaUser, FaWallet, FaBell, FaPaintBrush, FaTrash } from "react-icons/fa";

function Settings() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [walletAddress, setWalletAddress] = useState("");
  const [notifications, setNotifications] = useState("enabled");
  const [theme, setTheme] = useState("dark");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);

  useEffect(() => {
    document.title = "Settings | Solrise";

    const storedSettings = JSON.parse(localStorage.getItem("userSettings"));
    if (storedSettings) {
      setEmail(storedSettings.email || "");
      setWalletAddress(storedSettings.walletAddress || "");
    } else {
      fetchSettings();
    }
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/users/me`);
      const { email, privacy, walletAddress, notifications, theme } = response.data;
      setEmail(email || "");
      setPrivacy(privacy || "public");
      setWalletAddress(walletAddress || "");
      setNotifications(notifications || "enabled");
      setTheme(theme || "dark");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("Failed to load settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      await api.put(`/users/settings`, { email, walletAddress, privacy, notifications, theme });
      localStorage.setItem("userSettings", JSON.stringify({ email, walletAddress }));
      setSuccessMessage("Settings updated successfully!");
    } catch (error) {
      setErrorMessage("Failed to update settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    setShowConfirmationModal(true);
  };

  const confirmDeleteAccount = () => {
    console.log("Account deleted.");
    setShowConfirmationModal(false);
  };

  const cancelDeleteAccount = () => {
    setShowConfirmationModal(false);
  };

  return (
    <div className="settings-container">
      <h2 className="settings-header">Account Settings</h2>
      {loading ? (
        <Loader />
      ) : (
        <>
          <form onSubmit={handleUpdateSettings} className="settings-form">
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <FaEnvelope className="input-icon" />
              <input type="email" id="email" value={email} placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Password:</label>
              <FaLock className="input-icon" />
              {!showPasswordField ? (
                <button
                  type="button"
                  onClick={() => setShowPasswordField(true)}
                  className="change-password-btn"
                >
                  Change Password
                </button>
              ) : (
                <input
                  type="password"
                  value={password}
                  placeholder="Enter new password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
            </div>

            <div className="form-group">
              <label htmlFor="privacy">Privacy:</label>
              <FaUser className="input-icon" />
              <select id="privacy" value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="notifications">Notifications:</label>
              <FaBell className="input-icon" />
              <select id="notifications" value={notifications} onChange={(e) => setNotifications(e.target.value)}>
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="theme">Theme:</label>
              <FaPaintBrush className="input-icon" />
              <select id="theme" value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="walletAddress">Wallet Address:</label>
              <FaWallet className="input-icon" />
              <input type="text" id="walletAddress" value={walletAddress} placeholder="Enter your wallet address (optional)" onChange={(e) => setWalletAddress(e.target.value)} />
            </div>

            {errorMessage && <p className="notification notification-error">{errorMessage}</p>}
            {successMessage && <p className="notification notification-success">{successMessage}</p>}

            <button type="submit" className="settings-save-btn" disabled={loading}>
              {loading ? "Saving..." : "Save Settings"}
            </button>
          </form>

          <div className="settings-delete">
            <button onClick={handleDeleteAccount} className="delete-account-btn">
              <FaTrash /> Delete Account
            </button>
          </div>

          {showConfirmationModal && (
            <div className="confirmation-modal">
              <p>Are you sure you want to delete your account? This action is irreversible.</p>
              <button onClick={confirmDeleteAccount} className="confirm-btn">Yes, Delete</button>
              <button onClick={cancelDeleteAccount} className="cancel-btn">Cancel</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Settings;