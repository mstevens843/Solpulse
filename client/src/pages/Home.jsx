/**
 * Home.js - Main Homepage for SolPulse
 *
 * This page is responsible for:
 * - Displaying the main user feed with posts.
 * - Showing a real-time crypto ticker in the left sidebar.
 * - Providing an explore section in the right sidebar.
 * - Fetching user authentication data from `AuthContext`.
 */

import React, { useContext, useEffect, useState, Suspense } from "react";
import Feed from "@/components/Post_components/Feed";
import { AuthContext } from "@/context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom"; // Also import navigate

import "@/css/pages/Home.css";

// #1 Lazy Load: Defer loading of sidebars until needed
const Explore = React.lazy(() => import("@/components/Post_components/Explore"));
const CryptoTicker = React.lazy(() => import("@/components/Crypto_components/CryptoTicker"));

function Home() {
  const { user } = useContext(AuthContext);  // Get user from context
  const location = useLocation();
  const navigate = useNavigate(); // Add this below your other hooks

  const [showWelcome, setShowWelcome] = useState(false); // Fixed here

  useEffect(() => {
    if (location.state?.signupSuccess) {
      setShowWelcome(true); // Show banner
      navigate(location.pathname, { replace: true, state: {} }); // Clear state on first mount only
    }
  }, [location, navigate]);


  // Skeleton Loader state for Feed loading experience
  const [feedLoading, setFeedLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setFeedLoading(false), 500); // Simulate short delay
    return () => clearTimeout(timer);
  }, []);

  return (
      <div className="home-page-container" style={{ paddingTop: showWelcome ? '70px' : '50px' }}> 

      {showWelcome && (
        <div className="welcome-banner">
          🎉 Signup Successful! Welcome to SolPulse. 
        </div>
      )}

      <aside className="home-left">
        {/* #1 Lazy load with fallback */}
        <Suspense fallback={<div className="sidebar-loader">Loading Ticker...</div>}>
          <CryptoTicker />
        </Suspense>
      </aside>

      <main className="home-middle">
        {feedLoading ? (
          // #2 Basic skeleton loader placeholder
          <div className="feed-skeleton">Loading your feed...</div>
        ) : (
          <Feed key={location.key} currentUser={user} />

        )}
      </main>

      <aside className="home-right">
        {/* #1 Lazy load with fallback */}
        <Suspense fallback={<div className="sidebar-loader">Loading Explore...</div>}>
          <Explore />
        </Suspense>
      </aside>

      {/* Future: Add buttons or drag/drop to customize sidebars */}
    </div>
  );
}

export default Home;


/**
 * Potential Improvements:
 * - **Lazy Load Components:** Optimize performance by lazy-loading `CryptoTicker` and `Explore` for faster initial rendering.
 * - **Skeleton Loaders:** Implement a loading state before displaying `Feed`, improving UX.
 * - **User Customization:** Allow users to toggle or rearrange sidebars to personalize the homepage.
 * - **Infinite Scrolling:** Implement infinite scroll in `Feed` to enhance content consumption. - SKIPPED
 */