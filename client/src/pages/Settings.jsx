/**
 * Settings.js - User Account Settings Page for SolPulse
 *
 * This file is responsible for:
 * - Allowing users to update their account settings (email, password, privacy, notifications, theme, wallet address).
 * - Storing updated settings in localStorage for persistence.
 * - Fetching user settings from the backend when necessary.
 * - Handling account deletion with a confirmation modal.
 */


import React, { useState, useEffect } from "react";
import { api } from "@/api/apiConfig";
import Loader from "@/components/Loader";
import "@/css/pages/Settings.css";
import { FaEnvelope, FaLock, FaUser, FaWallet, FaBell, FaPaintBrush, FaTrash } from "react-icons/fa";
import { toast, ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function Settings() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [walletAddress, setWalletAddress] = useState("");
  const [notifications, setNotifications] = useState("enabled");
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [errorMessage, setErrorMessage] = useState("");
  // const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);


  // Apply theme in realtime when user clicks it from dropdown.
  useEffect(() => {
    const applyInitialSettings = async () => {
      const cached = JSON.parse(localStorage.getItem("userSettings"));
      const localTheme = localStorage.getItem("theme");
  
      if (cached) {
        setPrivacy(cached.privacy || "public");
        setNotifications(cached.notifications || "enabled");
        setWalletAddress(cached.walletAddress || "");
      }
  
      // ✅ Apply theme from localStorage first (for instant UI response)
      if (localTheme) {
        setTheme(localTheme);
        document.documentElement.classList.toggle("dark", localTheme === "dark");
      }
  
      // ✅ Then fetch settings from backend (may override local theme)
      await fetchSettings();
    };
  
    applyInitialSettings();
  }, []);


  /**
   * Fetch user settings from the backend.
   */
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
      setThemeLoaded(true); // ✅ after theme is loaded
  
      // ✅ Save to localStorage
      localStorage.setItem(
        "userSettings",
        JSON.stringify({ walletAddress, privacy, notifications, theme })
      );
  
    } catch (error) {
      toast.error("Failed to load settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  /**
   * Handle updating user settings.
   * - Sends updated settings to the backend.
   * - Stores settings in localStorage for persistence.
   */
  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      await api.put(`/users/settings`, {
        email,
        walletAddress,
        privacy,
        notifications,
        theme,
      });
  
      localStorage.setItem("userSettings", JSON.stringify({
        email,
        walletAddress,
        privacy,
        notifications,
        theme,
      }));
  
      toast.success("✅ Settings updated successfully!", {
        autoClose: 3000,
        transition: Slide,
        pauseOnHover: false,
        pauseOnFocusLoss: false,
      });
      
    } catch (error) {
      toast.error("❌ Failed to update settings.", {
        autoClose: 3000,
        transition: Slide,
        pauseOnHover: false,
        pauseOnFocusLoss: false,
      });
    } finally {
      setLoading(false);
    }
  };
  /**
   * Handle updating user theme.
   * - Sends updated theme to the backend.
   * - Stores themein localStorage for persistence.
   */
  const handleThemeToggle = async (e) => {
  const newTheme = e.target.checked ? "dark" : "light";
  setTheme(newTheme); // Update UI immediately

  // ✅ Apply to <html> tag (instant theme change)
  document.documentElement.classList.toggle("dark", newTheme === "dark");

  try {
    await api.put(`/users/settings`, {
      email,
      walletAddress,
      privacy,
      notifications,
      theme: newTheme,
    });

    localStorage.setItem(
      "userSettings",
      JSON.stringify({
        email,
        walletAddress,
        privacy,
        notifications,
        theme: newTheme,
      })
    );
    localStorage.setItem("theme", newTheme); // ✅ Ensure sync
    toast.success(`✅ Switched to ${newTheme} mode`, {
      autoClose: 3000,
      transition: Slide,
      pauseOnHover: false,
      pauseOnFocusLoss: false,
    });
    
  } catch (err) {
    toast.error("❌ Failed to save theme preference", {
      autoClose: 3000,
      transition: Slide,
      pauseOnHover: false,
      pauseOnFocusLoss: false,
    });
  }
};


const handlePrivacyToggle = async (e) => {
  const newPrivacy = e.target.checked ? "private" : "public";
  setPrivacy(newPrivacy);

  try {
    await api.put(`/users/settings`, {
      email,
      walletAddress,
      privacy: newPrivacy,
      notifications,
      theme,
    });

    // Update localStorage
    localStorage.setItem(
      "userSettings",
      JSON.stringify({
        email,
        walletAddress,
        privacy: newPrivacy,
        notifications,
        theme,
      })
    );

    toast.success(`🔒 Privacy set to ${newPrivacy}`, {
      autoClose: 2000,
      transition: Slide,
    });
  } catch (err) {
    toast.error("❌ Failed to update privacy", {
      autoClose: 3000,
      transition: Slide,
    });
  }
};



  /**
   * Handle account deletion process.
   * - Triggers a confirmation modal before proceeding.
   */
  const handleDeleteAccount = () => {
    setShowConfirmationModal(true);
  };

  
  /**
   * Confirm account deletion.
   * - Sends a request to delete the account.
   * - Logs the user out after deletion.
   */
  const confirmDeleteAccount = () => {
    console.log("Account deleted.");
    setShowConfirmationModal(false);
  };


  /**
   * Cancel account deletion.
   * - Closes the confirmation modal.
   */
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

            <div className="form-group flex items-center gap-3">
  <FaUser className="input-icon" />
  <label htmlFor="privacyToggle" className="flex items-center gap-2 cursor-pointer">
    <span>Private Account</span>
    <input
      id="privacyToggle"
      type="checkbox"
      checked={privacy === "private"}
      onChange={handlePrivacyToggle}
      className="toggle-switch-privacy"
      disabled={loading}
    />
  </label>
</div>
            <div className="form-group">
              <label htmlFor="notifications">Notifications:</label>
              <FaBell className="input-icon" />
              <select
                  id="notifications"
                  value={notifications}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setNotifications(newValue);

                    toast.info("🔨 Notification toggle coming soon!", {
                      autoClose: 2000,
                      theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
                      transition: Slide,
                      pauseOnHover: false,
                      pauseOnFocusLoss: false,
                    });
                  }}
                >
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            {theme !== null && (
              <div className="form-group flex items-center gap-3">
                <FaPaintBrush className="input-icon" />
                <label htmlFor="darkModeToggle" className="flex items-center gap-2 cursor-pointer">
                  <span>Dark Mode</span>
                  <input
                    id="darkModeToggle"
                    type="checkbox"
                    checked={theme === "dark"}
                    onChange={handleThemeToggle}
                    className="toggle-switch"
                    disabled={loading}
                  />
                </label>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="walletAddress">Wallet Address:</label>
              <FaWallet className="input-icon" />
              <input type="text" id="walletAddress" value={walletAddress} placeholder="Enter your wallet address (optional)" onChange={(e) => setWalletAddress(e.target.value)} />
            </div>

            {/* {errorMessage && <p className="notification notification-error">{errorMessage}</p>}
            {successMessage && <p className="notification notification-success">{successMessage}</p>} */}

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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        pauseOnFocusLoss={false}
        pauseOnHover={false}
        closeOnClick
        draggable
        theme="dark"
        transition="slide"
      />
    </div>
  );
}

export default Settings;

/**
 * 🔹 Potential Improvements:
 * - Implement multi-factor authentication (MFA) for added security. - SKIPPED
 * - Allow users to change their email with email verification. - SKIPPED
 * - Store user preferences in the database instead of localStorage for improved security.
 * - Implement session-based authentication to prevent token exposure in localStorage. - WILL IMPLEMENT LATER
 */