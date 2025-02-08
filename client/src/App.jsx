import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

import { AuthProvider } from "@/context/AuthContext"; // Auth Context
import socket from "./socket"; // WebSocket instance

import NavBar from "@/components/Navbar";
import LandingPage from "./pages/LandingPage";
import Home from "@/pages/Home"
import Post from "@/components/Post_components/Post";
import Profile from "./pages/Profile";
import Explore from "./components/Explore";
import PostCreation from "./pages/PostCreation";
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
                        <AppContent />
                    </BrowserRouter>
                </WalletProvider>
            </ConnectionProvider>
        </AuthProvider>
    );
}

function AppContent() {
    const location = useLocation();
    const hideNavbarOnPaths = ["/"];

    return (
        <div className="app-container">
            {/* Conditionally render the NavBar */}
            {!hideNavbarOnPaths.includes(location.pathname) && <NavBar />}
            <main>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/profile/:id" element={<Profile />} />  {/* Correct path */}
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/activity" element={<ActivityPage />} />
                    <Route path="/post/create" element={<PostCreation />} />
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