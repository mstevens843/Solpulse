import React, { useState, useEffect, useCallback } from "react";
import { api } from "@/api/apiConfig";
import SearchBar from "@/components/SearchBar";
import "@/css/components/Explore.css";

function Explore() {
    const [trendingPosts, setTrendingPosts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Fetch trending posts sorted by likes
    const fetchTrending = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await api.get("/posts/trending");
            if (response.data.posts.length === 0) {
                setError("No trending posts available.");
            } else {
                setTrendingPosts(response.data.posts || []);
            }
        } catch (error) {
            console.error("Error fetching trending posts:", error);
            setError("Failed to load trending posts. Please refresh and try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTrending();
    }, [fetchTrending]);

    return (
        <div className="explore-container">
            <header className="explore-header">
                <h2>Explore</h2>
            </header>

            {/* Search Bar */}
            <section className="search-bar-container">
                <SearchBar 
                    query={searchQuery}
                    setQuery={setSearchQuery}
                    filters={["all", "posts", "users"]}
                />
            </section>

            {/* Trending Topics */}
            <section className="trending-section">
                <h3 className="trending-title">Trending Topics</h3>
                {error && <p className="explore-error" role="alert">{error}</p>}
                {loading ? (
                    <p className="explore-loading">Loading...</p>
                ) : trendingPosts.length > 0 ? (
                    <div className="trending-posts-grid">
                        {trendingPosts.map((post) => (
                            <div key={post.id} className="trending-post">
                                <h4>{post.author || "Anonymous"}</h4>
                                <p>{post.content || "No content available."}</p>
                                <p>Likes: {post.likes}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="trending-empty">No trending posts found. Try searching for specific topics.</p>
                )}
            </section>
        </div>
    );
}

export default Explore;