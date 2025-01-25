import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

import { AuthProvider } from "@/context/AuthContext"; // Auth Context
import socket from "./socket"; // WebSocket instance

import NavBar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import PostCreation from "./pages/PostCreation";
import PostDetail from "./pages/PostDetail";
import SearchResults from "./pages/SearchResults";
import Settings from "./pages/Settings";
import Signup from "./pages/Signup";
import TrendingCrypto from "./pages/TrendingCrypto";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Trade from "@/pages/Trade";



function App() {
    // Determine Solana network from environment variables
    const network = import.meta.env.VITE_SOLANA_NETWORK || WalletAdapterNetwork.Devnet;
    const endpoint = clusterApiUrl(network);

    // Wallet Adapters for Solana
    const wallets = [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter({ network }),
    ];

    // WebSocket connection handling
    useEffect(() => {
        socket.on("connect", () => {
            console.log("WebSocket connected:", socket.id);
        });

        socket.on("disconnect", () => {
            console.log("WebSocket disconnected");
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
                        <div className="app-container">
                            <NavBar />
                            <main>
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/profile/:id" element={<Profile />} />
                                    <Route path="/explore" element={<Explore />} />
                                    <Route path="/messages" element={<Messages />} />
                                    <Route path="/notifications" element={<Notifications />} />
                                    <Route path="/post/create" element={<PostCreation />} />
                                    <Route path="/post/:id" element={<PostDetail />} />
                                    <Route path="/search" element={<SearchResults />} />
                                    <Route path="/signup" element={<Signup />} />
                                    <Route path="/trending-crypto" element={<TrendingCrypto />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/settings" element={<Settings />} />
                                    <Route path="/trade" element={<Trade />} />
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                            </main>
                        </div>
                    </BrowserRouter>
                </WalletProvider>
            </ConnectionProvider>
        </AuthProvider>
    );
}

export default App;







// The NavBar component should be added to your App.js or similar layout component, ensuring it's visible across every page.

// Changes:
// Consistent API Environment Handling: Ensure any page or component using API calls leverages process.env.REACT_APP_API_URL in their respective files 
// (already updated in prior edits).
// Added Missing Routes: Integrated missing pages as per the file structure provided (e.g., Explore, Messages, Notifications).
// Semantic Enhancements:
// Wrapped the routes in a <main> tag to indicate the main content of the app.
// Added a container <div> with the class app-container for styling and layout flexibility.

// Changes Made
// Added NotFound Route:

// Route component={NotFound} acts as a fallback for invalid URLs.
// It ensures users see a 404 page if they visit an undefined route.
// Imported NotFound:

// Imported the NotFound page from ./pages/NotFound