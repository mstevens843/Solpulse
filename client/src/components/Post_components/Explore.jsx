/**
 * Explore.js - Component for browsing trending posts and searching for content.
 *
 * This file is responsible for:
 * - Displaying trending posts based on likes.
 * - Providing a search bar for users to explore posts and users.
 * - Handling API requests to fetch trending content.
 */


import React, { useState, useEffect, useCallback, useRef } from "react"; 
import { api } from "@/api/apiConfig";
import Post from "@/components/Post_components/Post";
import SearchBar from "@/components/SearchBar";
import ExploreModal from "@/components/Post_components/Modals/ExploreModal";

import { useAuth } from "@/context/AuthContext";
import "@/css/components/Explore.css";

function Explore() {
  const { currentUser } = useAuth(); /
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1); 
  const [hasMore, setHasMore] = useState(true); 
  const [filter, setFilter] = useState("24h"); 
  const observer = useRef(); 
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPost, setSelectedPost] = useState(null); 


  /**
   *  Fetch trending posts with filter & pagination
   */
  useEffect(() => {
    const fetchTrending = async () => {
      if (loading || !hasMore) return;
  
      setLoading(true);
      setError("");
  
      try {
        const response = await api.get(`/posts/trending?page=${page}&filter=${filter}`);
        const newPosts = response.data.posts || [];
  
        // Check for duplicates or end of list
        const isDuplicatePage =
          newPosts.length === 0 ||
          newPosts.every((newPost) =>
            trendingPosts.find((p) => p.id === newPost.id)
          );
  
        if (isDuplicatePage) {
          setHasMore(false);
          return;
        }
  
        const postIds = newPosts.map((p) => p.id);
        const countRes = await api.post("/comments/batch-count", { postIds });
  
        const countsMap = {};
        countRes.data.counts.forEach(({ postId, count }) => {
          countsMap[postId] = count;
        });
  
        const enrichedPosts = newPosts.map((post) => ({
          ...post,
          commentCount: countsMap[post.id] || 0,
        }));

        // Filter out private posts unless viewer is allowed
        const filteredPosts = enrichedPosts.filter((post) => {
          const author = post.user;
          const isPrivate = author?.privacy === "private";
          const isOwner = author?.id === currentUser?.id;
          const isFollower = author?.isFollowedByCurrentUser;

          const isRepostOfPrivate =
            post.originalPost?.user?.privacy === "private" &&
            post.originalPost?.user?.id !== currentUser?.id &&
            !post.originalPost?.user?.isFollowedByCurrentUser;

          return (!isPrivate || isOwner || isFollower) && !isRepostOfPrivate;
        });
  
        setTrendingPosts((prev) =>
          page === 1 ? filteredPosts : [...prev, ...filteredPosts]
        );
      } catch (err) {
        console.error("Error fetching trending posts:", err);
        setError("Failed to load trending posts. Please refresh and try again.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchTrending(); // Make sure this stays inside useEffect
  }, [page, filter]); // Dependency array

  /**
   *  Reset on filter change
   */
  useEffect(() => {
    setTrendingPosts([]);
    setPage(1);
    setHasMore(true);
  }, [filter]);



  /**
   * Infinite scroll observer
   */
  const lastPostRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
  
      observer.current = new IntersectionObserver((entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loading && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
  
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const handlePostClick = (post) => {
    console.log("🧠 ExploreModal opening for post:", post.id);
    setSelectedPost(post);
  };

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
  
      {/*  Filter Dropdown */}
      <section className="filter-controls">
        <label>Filter by:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="24h">Last 24 Hours</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </section>
  
      {/* Trending Section */}
      <section className="trending-section">
        <h3 className="trending-title">Trending Topics</h3>
  
  
        {/* Category Tabs (just once here!) */}
        <section className="category-tabs">
          {["All", "🔥 Meme", "🎨 NFT", "🪙 Crypto", "🧠 DAO", "💣 On-chain Drama"].map((cat) => (
            <button
              key={cat}
              className={`category-tab ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </section>
  
        <hr className="my-4 border-gray-600" />
  
        {error && <p className="explore-error" role="alert">{error}</p>}
  
        {/* Trending Posts */}
        {trendingPosts.length === 0 && !loading ? (
          <p className="trending-empty">No trending posts found. Try searching for specific topics.</p>
        ) : (
          <div className="trending-posts-grid">
            {trendingPosts
              .filter((post) => {
                const cleanCategory = selectedCategory.replace(/^[^\w]+/, "").trim(); // Remove emoji
                return cleanCategory === "All"
                  ? true
                  : (post.category || "General") === cleanCategory;
              })
              
              .map((post, idx, arr) => {
                const isLast = idx === arr.length - 1;
                return (
                  <div
                    key={post.id}
                    ref={isLast ? lastPostRef : null}
                    className="trending-post"
                  >
                    <Post
                      post={post}
                      currentUser={currentUser}
                      setPosts={setTrendingPosts}
                      onClick={() => handlePostClick(post)}
                      fromExplore={true}
                    />
                  </div>



                  
                );
              })}
          </div>
        )}
  
        {loading && <p className="explore-loading">Loading...</p>}
        {selectedPost && (
          <ExploreModal
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
            currentUser={currentUser}
            setPosts={setTrendingPosts}
          />
        )}
      </section>
    </div>
  );
}  
    


export default Explore;