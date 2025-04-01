/**
 * AuthProvider.js - Provides authentication context for SolPulse.
 *
 * This file is responsible for:
 * - Managing user authentication state and session persistence.
 * - Fetching and storing user data securely in localStorage.
 * - Handling user likes and retweets with sessionStorage for efficiency.
 * - Exposing authentication state and user details via `AuthContext`.
 */


import React, { createContext, useState, useEffect } from "react";
import { api } from "@/api/apiConfig"; // Axios instance

export const AuthContext = createContext();


/**
 * AuthProvider Component
 *
 * - Manages user authentication state.
 * - Loads user details from localStorage or fetches them from the API.
 * - Handles storing and retrieving liked and retweeted posts efficiently.
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [likedPosts, setLikedPosts] = useState(new Set()); //  Store liked posts
    const [retweetedPosts, setRetweetedPosts] = useState(new Set()); //  Store retweeted posts


    /**
     * Loads user authentication state on mount.
     *
     * - Retrieves token from `localStorage`.
     * - If a user is stored, loads it; otherwise, fetches fresh user data.
     */
    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            const storedUser = localStorage.getItem("user");

            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error("Error parsing stored user data:", error);
                    localStorage.removeItem("user"); // Remove corrupted data
                } finally {
                    setLoading(false);
                }
            } else {
                const fetchUser = async () => {
                    try {
                        const response = await api.get("/auth/me");
                        const userData = response.data;
                        setUser(userData);
                        localStorage.setItem("user", JSON.stringify(userData));
                        setIsAuthenticated(true);
                    } catch (error) {
                        console.error("Error fetching user data:", error);
                        localStorage.removeItem("token");
                        setIsAuthenticated(false);
                    } finally {
                        setLoading(false);
                    }
                };

                fetchUser();
            }
        } else {
            setLoading(false);
            setIsAuthenticated(false);
        }
    }, []);





     /**
     * Loads liked and retweeted posts from sessionStorage.
     *
     * - Ensures like/retweet state persists across page reloads.
     */
     useEffect(() => {
        const storedLikes = sessionStorage.getItem("likedPosts");
        const storedRetweets = sessionStorage.getItem("retweetedPosts");

        if (storedLikes) setLikedPosts(new Set(JSON.parse(storedLikes)));
        if (storedRetweets) setRetweetedPosts(new Set(JSON.parse(storedRetweets)));
    }, []);

    /**
     * Fetches batch like/retweet statuses for the logged-in user.
     *
     * - Reduces API calls by using batch endpoints.
     * - Stores results in sessionStorage for faster access.
     */
    useEffect(() => {
        if (!user?.id) return;
    
        const fetchLikesAndRetweets = async () => {
            try {
                const [likeResponse, retweetResponse] = await Promise.all([
                    api.get("/posts/likes/batch"),        // ✅ Still uses Like pivot
                    api.get("/posts/retweets/batch"),     // ✅ Now returns from Posts (not pivot)
                ]);
    
                const likedPostIds = new Set(likeResponse.data.likedPosts);
    
                // ✅ `retweetResponse.data.retweetedPosts` should now contain `originalPostId`s
                const retweetedPostIds = new Set(
                    retweetResponse.data.retweetedPosts.filter(Boolean)
                );
    
                setLikedPosts(likedPostIds);
                setRetweetedPosts(retweetedPostIds);
    
                sessionStorage.setItem("likedPosts", JSON.stringify([...likedPostIds]));
                sessionStorage.setItem("retweetedPosts", JSON.stringify([...retweetedPostIds]));
            } catch (err) {
                console.error("Error fetching batch like/retweet data:", err);
            }
        };
    
        fetchLikesAndRetweets();
    }, [user]);


    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                isAuthenticated,
                setIsAuthenticated,
                likedPosts,
                setLikedPosts,
                retweetedPosts,
                setRetweetedPosts,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

import { useContext } from "react";

export const useAuth = () => useContext(AuthContext);

/**
 * Potential Improvements: - SKIP ALL FOR NOW
 * - **Token Expiry Handling:** Implement token refresh or auto-logout when token expires.
 * - **Centralized Error Handling:** Create a dedicated error handler to standardize error responses.
 * - **Performance Optimization:** Store user state in a global state manager (e.g., Redux or Zustand).
 * - **Lazy Loading User Data:** Fetch only when required instead of preloading on mount.
 */