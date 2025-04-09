/**
 * App.js - Main Application Entry Point for SolPulse
 *
 * This file is responsible for:
 * - Setting up the React Router for navigation.
 * - Managing authentication state using `AuthProvider`.
 * - Integrating Solana wallet providers (`Phantom`, `Solflare`).
 * - Establishing WebSocket connections for real-time updates.
 */

import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { useContext } from "react";
import { AuthContext, AuthProvider } from "@/context/AuthContext";
import socket from "./socket"; // WebSocket instance
import ScrollToTop from "@/utils/ScrollToTop"; // ✅ Add this at the top


import NavBar from "@/components/NavBar";
import LandingPage from "./pages/LandingPage";
import Home from "@/pages/Home"
import Post from "@/components/Post_components/Post";
import Profile from "./pages/Profile";
import Explore from "./components/Post_components/Explore";
// import PostCreation from "./pages/PostCreation";
import SearchResults from "./pages/SearchResults";
import Settings from "./pages/Settings";
import Signup from "./pages/Signup";
import TrendingCrypto from "./pages/TrendingCrypto";
import Login from "./components/Login";
import NotFound from "./pages/NotFound";
import Trade from "@/pages/Trade";
import ActivityPage from "./pages/Activity";
import JupiterSwap from "@/pages/JupiterSwap"; 



function App() {
    /**
     * Determines the Solana network to use (Mainnet, Devnet, or Testnet).
     * Defaults to `Devnet` if no environment variable is provided.
     */
    const network = import.meta.env.VITE_SOLANA_NETWORK || WalletAdapterNetwork.Devnet;
    const endpoint = clusterApiUrl(network);

    /**
     * Wallet Adapters for Solana.
     * - Phantom Wallet
     * - Solflare Wallet
     */
    const wallets = [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter({ network }),
    ];

    /**
     * Add dark/lighy mode functionality to app. 
     */

    const { user } = useContext(AuthContext);
    useEffect(() => {
        // ✅ 1. If user is logged in and has theme in DB, use it and persist to localStorage
        if (user?.theme) {
          document.documentElement.classList.toggle("dark", user.theme === "dark");
          localStorage.setItem("theme", user.theme);
        } else {
          // ✅ 2. Otherwise check localStorage or system preference
          const storedTheme = localStorage.getItem("theme");
      
          if (storedTheme === "dark" || storedTheme === "light") {
            document.documentElement.classList.toggle("dark", storedTheme === "dark");
          } else {
            // ✅ 3. First-time visitor? Respect system preference
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            const systemTheme = prefersDark ? "dark" : "light";
            document.documentElement.classList.toggle("dark", prefersDark);
            localStorage.setItem("theme", systemTheme);
          }
        }
      }, [user?.theme]);

    //   useEffect(() => {
    //     const saved = localStorage.getItem("theme");
    //     const theme = saved || "dark"; // 🔥 default to dark
    //     document.documentElement.classList.remove("dark", "light");
    //     document.documentElement.classList.add(theme);
    //   }, []);

    /**
     * WebSocket connection handling for real-time events.
     * - Logs when the WebSocket connects or disconnects.
     * - Cleans up event listeners when the component unmounts.
     */
    // WebSocket connection handling
    useEffect(() => {
        socket.on("connect", () => {
            if (import.meta.env.VITE_ENV === "development") {
                console.log("WebSocket connected:", socket.id);
            }
        });

        socket.on("disconnect", () => {
            if (import.meta.env.VITE_ENV === "development") {
                console.log("WebSocket disconnected");
            }
        });

        return () => {
            socket.off("connect");
            socket.off("disconnect");
        };
    }, []);


    return (
        <AuthProvider>
            <ConnectionProvider endpoint={endpoint}>
                <WalletProvider wallets={wallets} autoConnect>
                    <BrowserRouter>
                        <AppContent />
                    </BrowserRouter>
                </WalletProvider>
            </ConnectionProvider>
        </AuthProvider>
    );
}


/**
 * AppContent - Manages page routing and conditional navbar rendering.
 * 
 * - Uses `useLocation()` to conditionally hide the navbar on certain paths.
 * - Defines all routes and their respective components.
 */
function AppContent() {
    const location = useLocation();
    const hideNavbarOnPaths = ["/"];

    return (
        <div className="app-container">
            {/* 👇 Scroll to top on route change */}
            <ScrollToTop />
            {/* Conditionally render the NavBar */}
            {!hideNavbarOnPaths.includes(location.pathname) && <NavBar />}
            <main>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/profile/:id" element={<Profile key={location.pathname} />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/activity" element={<ActivityPage />} />
                    {/* <Route path="/post/create" element={<PostCreation />} /> */}
                    <Route path="/post/:id" element={<Post />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/trending-crypto" element={<TrendingCrypto />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/trade" element={<Trade />} />
                    <Route path="/swap" element={<JupiterSwap />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;



/**
 * Potential Improvements:
 * - **Lazy Loading:** Implement React's `Suspense` to dynamically load routes and reduce initial load time. - Skipped
 * - **Error Boundary Handling:** Wrap routes inside an error boundary to gracefully catch component errors. - Skipped
 * - **WebSocket Optimizations:** Implement a reconnect mechanism if the WebSocket disconnects unexpectedly. - Skipped
 * - **Enhanced Routing Logic:** Store `hideNavbarOnPaths` in a config file for better maintainability. - Skipped 
 */