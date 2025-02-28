import React, { createContext, useState, useEffect } from "react";
import { api } from "@/api/apiConfig"; // Axios instance

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [likedPosts, setLikedPosts] = useState(new Set()); //  Store liked posts
    const [retweetedPosts, setRetweetedPosts] = useState(new Set()); //  Store retweeted posts

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

     //  Load likes/retweets from sessionStorage (for persistence across reloads)
     useEffect(() => {
        const storedLikes = sessionStorage.getItem("likedPosts");
        const storedRetweets = sessionStorage.getItem("retweetedPosts");

        if (storedLikes) setLikedPosts(new Set(JSON.parse(storedLikes)));
        if (storedRetweets) setRetweetedPosts(new Set(JSON.parse(storedRetweets)));
    }, []);

    //  Fetch batch like/retweet statuses ONCE per user
    useEffect(() => {
        if (!user?.id) return;

        const fetchLikesAndRetweets = async () => {
            try {
                const [likeResponse, retweetResponse] = await Promise.all([
                    api.get("/posts/likes/batch"),
                    api.get("/posts/retweets/batch"),
                ]);

                const likedPostIds = new Set(likeResponse.data.likedPosts);
                const retweetedPostIds = new Set(retweetResponse.data.retweetedPosts);

                setLikedPosts(likedPostIds);
                setRetweetedPosts(retweetedPostIds);

                // ✅ Store in sessionStorage to reduce API calls
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