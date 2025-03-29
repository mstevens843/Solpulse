/**
 * Explore.js - Component for browsing trending posts and searching for content.
 *
 * This file is responsible for:
 * - Displaying trending posts based on likes.
 * - Providing a search bar for users to explore posts and users.
 * - Handling API requests to fetch trending content.
 */


import React, { useState, useEffect, useCallback, useRef } from "react"; // ✅ Added useRef for infinite scroll
import { api } from "@/api/apiConfig";
import Post from "@/components/Post_components/Post";
import SearchBar from "@/components/SearchBar";
import "@/css/components/Explore.css";

function Explore() {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1); // ✅ For pagination
  const [hasMore, setHasMore] = useState(true); // ✅ Tracks if more posts are available
  const [filter, setFilter] = useState("24h"); // ✅ Time filter state
  const observer = useRef(); // ✅ IntersectionObserver ref

  /**
   * ✅ Fetch trending posts with filter & pagination
   */
 useEffect(() => {
  const fetchTrending = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/posts/trending?page=${page}&filter=${filter}`);
      const newPosts = response.data.posts || [];

      const postIds = newPosts.map((p) => p.id);
      const countRes = await api.post("/comments/batch-count", { postIds });

      // Map postId to count
      const countsMap = {};
      countRes.data.counts.forEach(({ postId, count }) => {
        countsMap[postId] = count;
      });

      // Enrich posts
      const enrichedPosts = newPosts.map((post) => ({
        ...post,
        commentCount: countsMap[post.id] || 0,
      }));

      setTrendingPosts((prev) =>
        page === 1 ? enrichedPosts : [...prev, ...enrichedPosts]
      );

      if (newPosts.length === 0) setHasMore(false);
    } catch (err) {
      console.error("Error fetching trending posts:", err);
      setError("Failed to load trending posts. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  fetchTrending();
}, [page, filter]);

  /**
   * ✅ Reset on filter change
   */
  useEffect(() => {
    setTrendingPosts([]);
    setPage(1);
    setHasMore(true);
  }, [filter]);



  /**
   * ✅ Infinite scroll observer
   */
  const lastPostRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

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

      {/* ✅ Filter Dropdown */}
      <section className="filter-controls">
        <label>Filter by:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="24h">Last 24 Hours</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </section>

      <section className="trending-section">
        <h3 className="trending-title">Trending Topics</h3>

        {error && <p className="explore-error" role="alert">{error}</p>}

        {/* ✅ Trending Posts */}
        {trendingPosts.length === 0 && !loading ? (
          <p className="trending-empty">No trending posts found. Try searching for specific topics.</p>
        ) : (
          <div className="trending-posts-grid">
            {trendingPosts.map((post, idx) => {
              const isLast = idx === trendingPosts.length - 1;
              return (
                <div
                  key={post.id}
                  ref={isLast ? lastPostRef : null}
                  className="trending-post"
                >
                  <Post post={post} currentUser={null} setPosts={setTrendingPosts} />
                </div>
              );
            })}
          </div>
        )}

        {loading && <p className="explore-loading">Loading...</p>} {/* ✅ Loader during fetch */}
      </section>
    </div>
  );
}

export default Explore;



/**
 * 🔹 Potential Improvements:
 * - Implement infinite scrolling for better user experience. 
 * - Allow users to filter trending posts by time period (e.g., Last 24h, This Week).
 * - Add real-time updates to reflect trending posts dynamically.
 */


/**
 * ✅ Summary of Implemented Features
    Feature	✅ Implemented
    Infinite Scroll	✅ via IntersectionObserver
    Time Filter (24h, Week, Month)	✅ Dropdown UI + backend param
    "Live" Updates on Scroll	✅ Pagination + dynamic fetch
    Clean Reset on Filter Change	✅ useEffect clears old state
    Accessible Error + Loading States	✅ role="alert" + Loading...
 */