import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import NotificationBell from "@/components/Notification_components/NotificationBell";
import { AuthContext } from "@/context/AuthContext";
import { api } from "@/api/apiConfig";
import "@/css/components/NavBar.css";

const NavBar = () => {
    const { isAuthenticated, setIsAuthenticated, setUser } = useContext(AuthContext);
    const [fetchedUser, setFetchedUser] = useState(null);
    const wallet = useWallet();
    const [walletMenuVisible, setWalletMenuVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get("/auth/me");
                setFetchedUser(response.data);
                setUser(response.data);
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };

        if (isAuthenticated && !fetchedUser) {
            fetchUser();
        }
    }, [isAuthenticated, fetchedUser, setUser]);

    console.log("NavBar User ID:", fetchedUser?.id);

    // Logout Handler
    const handleLogout = async () => {
        try {
            await api.post("/auth/logout"); // Call the backend to blacklist the token and clear cookies
            localStorage.removeItem("token"); // Clear token from local storage
            localStorage.removeItem("user"); 
            setUser(null);
            setIsAuthenticated(false);
            navigate("/"); 
        } catch (error) {
            console.error("Logout failed:", error);
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
                {/* {isAuthenticated && (
                    <li className="navbar-item" key="create-post">
                        <NavLink to="/post/create" className={({ isActive }) => (isActive ? "active-link" : "")} aria-label="Create Post">
                            Create Post
                        </NavLink>
                    </li>
                )} */}
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
                <li className=" navbar-item">
                    <button 
                        className="navbar-wallet-button" 
                        onClick={() => setWalletMenuVisible(!walletMenuVisible)}
                    >
                        {wallet.connected 
                            ? wallet.publicKey?.toString().slice(0, 6) + "..." + wallet.publicKey?.toString().slice(-4) 
                            : "Select Wallet"}
                    </button>

                    {walletMenuVisible && (
                        <div className="wallet-options-dropdown">
                            {!wallet.connected ? (
                                <>
                                    <button onClick={async () => {
                                        try {
                                            await wallet.select("Phantom");
                                            await wallet.connect();
                                            setWalletMenuVisible(false);
                                        } catch (error) {
                                            console.error("Wallet connection failed:", error);
                                        }
                                    }}>
                                        Connect with Phantom
                                    </button>
                                    <button onClick={async () => {
                                        try {
                                            await wallet.select("Solflare");
                                            await wallet.connect();
                                            setWalletMenuVisible(false);
                                        } catch (error) {
                                            console.error("Wallet connection failed:", error);
                                        }
                                    }}>
                                        Connect with Solflare
                                    </button>
                                </>
                            ) : (
                                <button onClick={async () => {
                                    try {
                                        await wallet.disconnect();
                                        setWalletMenuVisible(false);
                                    } catch (error) {
                                        console.error("Wallet disconnection failed:", error);
                                    }
                                }}>
                                    Disconnect Wallet
                                </button>
                            )}
                        </div>
                    )}
                </li>
            </ul>
        </nav>
    );
};

export default NavBar;