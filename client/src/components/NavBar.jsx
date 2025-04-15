/**
 * NavBar.js
 * 
 * This file is responsible for rendering the main navigation bar for SolPulse.
 * It provides links to different sections of the app, handles user authentication,
 * and manages wallet connection/disconnection for Solana-based transactions.
 */

import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import NotificationBell from "@/components/Notification_components/NotificationBell";
import { AuthContext } from "@/context/AuthContext";
import { api } from "@/api/apiConfig";
import { toast } from "react-toastify";
import "@/css/components/NavBar.css";

const NavBar = () => {
    const { isAuthenticated, setIsAuthenticated, setUser } = useContext(AuthContext);
    const [fetchedUser, setFetchedUser] = useState(null);
    const wallet = useWallet();
    const [walletMenuVisible, setWalletMenuVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let retryCount = 0;
        const maxRetries = 3;
      
        const fetchUserWithRetry = async () => {
          while (retryCount < maxRetries) {
            try {
              const response = await api.get("/auth/me");
              setFetchedUser(response.data);
              setUser(response.data);
              return;
            } catch (error) {
              retryCount++;
              console.error(`Attempt ${retryCount} - Error fetching user:`, error);
              if (retryCount >= maxRetries) {
                console.warn("Max retries reached. Giving up on fetching user.");
              } else {
                await new Promise((res) => setTimeout(res, 1000));
              }
            }
          }
        };
      
        if (isAuthenticated && !fetchedUser) {
          fetchUserWithRetry();
        }
      }, [isAuthenticated, fetchedUser, setUser]);

    console.log("NavBar User ID:", fetchedUser?.id);

    /**
     * Handle user logout
     * - Calls backend logout API to invalidate session.
     * - Clears authentication data from localStorage.
     * - Redirects user to login page.
     */
    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
            localStorage.removeItem("token");
            localStorage.removeItem("user"); 
            setUser(null);
            setIsAuthenticated(false);
            navigate("/"); 
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    /**
     * Wallet Connection Logic  
     */
    const connectWallet = (walletName) => async () => {
        try {
        await wallet.select(walletName);
        await wallet.connect();
        toast.success(`Connected to ${walletName}`);
        setWalletMenuVisible(false);
        } catch (err) {
        toast.error(`Failed to connect with ${walletName}`);
        console.error(err);
        }
    };
    
    const disconnectWallet = async () => {
        try {
        await wallet.disconnect();
        toast.info("Wallet disconnected");
        setWalletMenuVisible(false);
        } catch (err) {
        toast.error("Failed to disconnect wallet");
        console.error(err);
        }
    };
  

    return (
        <nav className="navbar" aria-label="Main Navigation">
            {/* Left Side Navigation */}
            <ul className="navbar-left">
            {isAuthenticated && (
                <li className="navbar-item" key="home">
                    <NavLink to="/home" className={({ isActive }) => (isActive ? "active-link" : "")} aria-label="Go to Home">
                        Home
                    </NavLink>
                </li>
            )}
            <li className="navbar-item" key="trending-crypto">
                <NavLink to="/trending-crypto" className={({ isActive }) => (isActive ? "active-link" : "")} aria-label="Trending Crypto">
                    Trending Crypto
                </NavLink>
            </li>
            <li className="navbar-item" key="trade">
                <NavLink to="/trade" className={({ isActive }) => (isActive ? "active-link" : "")} aria-label="Trade">
                    Trade
                </NavLink>
            </li>

            {/* 🌓 Theme Toggle Button */}
            <li className="navbar-item" key="theme-toggle">
                <button
                    className="theme-nav-toggle"
                    onClick={() => {
                        const isDark = document.documentElement.classList.contains("dark");
                        document.documentElement.classList.toggle("dark", !isDark);
                        localStorage.setItem("theme", isDark ? "light" : "dark");
                    }}
                    aria-label="Toggle Theme"
                >
                    🌓
                </button>
            </li>
        </ul>

            {/* Right Side Navigation */}
            <ul className="navbar-right">
                {isAuthenticated ? (
                    <>
                        <li className="navbar-item" key="activity">
                            <NavLink to="/activity" className={({ isActive }) => (isActive ? "active-link" : "")} aria-label="View activity">
                                Activity
                            </NavLink>
                        </li>
                        <div className="notification-bell-container" key="notifications">
                            <NotificationBell />
                        </div>
                        <li className="navbar-item" key="profile">
                            <NavLink 
                                to={fetchedUser?.id ? `/profile/${fetchedUser.id}` : "/profile"} 
                                className={({ isActive }) => (isActive ? "active-link" : "")} 
                                aria-label="Profile"
                            >
                                Profile
                            </NavLink>
                        </li>

                        <li className="navbar-item" key="settings">
                            <NavLink to="/settings" className={({ isActive }) => (isActive ? "active-link" : "")} aria-label="Settings">
                                Settings
                            </NavLink>
                        </li>
                        <li className="navbar-item" key="logout">
                            <button onClick={handleLogout} className="logout-button" aria-label="Log Out">
                                Logout
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        <li className="navbar-item" key="login">
                            <NavLink to="/" className={({ isActive }) => (isActive ? "active-link" : "")} aria-label="Login">
                                Login
                            </NavLink>
                        </li>
                        <li className="navbar-item" key="signup">
                            <NavLink to="/signup" className={({ isActive }) => (isActive ? "active-link" : "")} aria-label="Sign Up">
                                Sign Up
                            </NavLink>
                        </li>
                    </>
                )}

                {/* Select Wallet Button */}
                <li className="navbar-item">
                <button
                    className={`navbar-wallet-button ${wallet.connected ? "connected" : "disconnected"}`}
                    onClick={() => setWalletMenuVisible((prev) => !prev)}
                >
                    {wallet.connected
                    ? `Connected: ${wallet.wallet?.adapter.name || "Wallet"}`
                    : "Select Wallet"}
                </button>

                {walletMenuVisible && (
                    <div className="wallet-options-dropdown">
                    {!wallet.connected ? (
                        <>
                        <button onClick={connectWallet("Phantom")}>Connect with Phantom</button>
                        <button onClick={connectWallet("Solflare")}>Connect with Solflare</button>
                        </>
                    ) : (
                        <button onClick={disconnectWallet}>Disconnect Wallet</button>
                    )}
                    </div>
                )}
                </li>
                
            </ul>
        </nav>
    );
};

export default NavBar;