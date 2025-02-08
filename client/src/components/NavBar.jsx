// NAVBAR component provides a navigation interface for users to access key sections of the app. 
// Includes:
// - HOME: redirects to HomePage
// - DASHBOARD: Takes users to their personalized dashboard

// WALLET CONNECTION: 
// Integrates 'WalletMultiButton' from the Solana Wallet Adapter UI to allow users to connect or disconnect their Solana wallet. 
// Displays wallet-related options directly in nav bar. 

// User-Friendly Design
// Provides a clean, intuitive interface for accessing critical parts of the app. 


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
            localStorage.removeItem("user"); // Clear user data from local storage
            setUser(null);
            setIsAuthenticated(false);
            navigate("/"); // Redirect to homepage to trigger UI update
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








// Summary of Changes:
// Updated handleLogout Function:

// Calls await api.post("/auth/logout") to notify the backend and blacklist the token.
// Clears localStorage by removing both token and user.
// Sets state to logout the user.
// Logout Button Update:

// Now includes the updated handleLogout function with backend API call.
// Error Handling:

// Catches any logout request failures and logs them.
// Expected Behavior:
// When the user clicks Logout, the following steps occur:
// The frontend sends a request to the backend to blacklist the token.
// The token and user data are removed from local storage.
// The user state in React is updated to reflect they are logged out.
// The frontend navigates away from protected routes.




// added wallet connection button. 


// PAGES WHERE NavBar component is Implemented: 
// APP LAYOUT: 
// why: NavBar is a global nav component and is typically included in the main app layout, to ensure it appears across all pages. 
// reference: Positioned at top of app and rendered on every page. 

// SPECIFIC PAGES (indirectly): 
// why: Since the NavBar is global, it will automatically appear on pages such as (Home page, Dashboard page, Explore Page, Profile Page, Messaging Page)



// Improvements Made: 
// Dynamic Links: 
// Show/hide specific links based on user authentication statue ("Login" or "Logout") 
// Mobile Responsiveness: make nav bar responsive for smaller screens using hamburger menu or similar. 
// Active Link Highlighting: Higlight active route to help users understand where they are. 

// NavBar.js
// Memoization:

// Wrapped the NavBar component with React.memo to prevent unnecessary re-renders when isAuthenticated doesn't change.
// Optimization:

// Ensured proper usage of props for controlled re-rendering based on isAuthenticated.

// Key Updates
// Component (NavBar.js)
// Active Link Handling:

// Updated NavLink to use the className callback for dynamic class assignment.
// WalletMultiButton:

// Wrapped the WalletMultiButton in a container (wallet-button-container) for better alignment and spacing.
// ARIA Accessibility:

// Ensured navigation links have aria-label attributes for screen reader support.
// Responsive Design:

// Future-proofed layout by ensuring links can stack vertically on smaller screens via CSS.

// Changes and Improvements:
// className Update with NavLink:

// Used the className function signature with NavLink to dynamically apply the active-link class for active links.
// Improved Accessibility:

// Added aria-label="Main Navigation" to the <nav> element to define its purpose clearly for assistive technologies.
// Ensured aria-label on each navigation item for clarity.
// React.memo Optimization:

// React.memo is retained for performance optimization, preventing unnecessary re-renders unless isAuthenticated changes.
// CSS Consistency:

// Ensures that the active-link class styling remains consistent across the application.
// Default Styling for WalletMultiButton:

// The Solana wallet button is integrated seamlessly into the navigation and inherits the default wallet styles.