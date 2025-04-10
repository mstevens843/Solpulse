/**
 * This file is responsible for rendering the Community Feed,
 * where users can view, create, and interact with posts.
 * 
 * Features:
 * - Fetches posts from the API with pagination and filtering.
 * - Implements infinite scrolling using the Intersection Observer API.
 * - Provides a PostComposer for creating new posts.
 * - Uses FeedFilter for sorting and filtering posts.
 * - Handles loading and error states gracefully.
 */




import React, { useState, useEffect, useRef, useContext } from "react";
import PropTypes from "prop-types";
import Post from "@/components/Post_components/Post";
import PostComposer from "@/components/Post_components/PostComposer";
import { api } from "@/api/apiConfig";
import { AuthContext } from "@/context/AuthContext";
import "@/css/components/Post_components/Feed.css";

function Feed({ currentUser }) {
  const [posts, setPosts] = useState([]);
  const [postIds, setPostIds] = useState(new Set()); // ✅ #2 Track unique post IDs
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  // const [filter, setFilter] = useState("foryou");
  const observerRef = useRef(null);
  const debounceTimeout = useRef(null); // ✅ #1 debounce reference
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filter, setFilter] = useState(() => localStorage.getItem("feedFilter") || "foryou");


  const handleFilterChange = (key) => {
    localStorage.setItem("feedFilter", key);
    setFilter(key);
    setPosts([]);
    setPostIds(new Set());
    setPage(1);
  };

  const buildCountsMap = (counts) => {
    const map = {};
    if (Array.isArray(counts)) {
      counts.forEach(({ postId, count }) => (map[postId] = count));
    } else if (counts && typeof counts === "object") {
      Object.entries(counts).forEach(([postId, count]) => {
        map[parseInt(postId)] = count;
      });
    } else {
      console.warn("⚠️ Warning: Missing or invalid counts in response", counts);
    }
    return map;
  };


  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
  
    try {
      console.log("Fetching posts for page:", page);
      const response = await api.get(`/posts?page=${page}&limit=10&feed=${filter}`); // ✅ Increased batch size
  
      if (response.data?.posts) {
        const newPosts = response.data.posts.filter(post => !postIds.has(post.id)); // ✅ Prevent duplicates
  
        // 🧠 Fetch comment counts in batch for new posts
        const postIdsToCheck = newPosts.map((p) => p.id);

        if (postIdsToCheck.length === 0) {
          setHasMore(false); // ⛔ No more posts, stop fetching
          return;
        }

        const countRes = await api.post("/comments/batch-count", { postIds: postIdsToCheck });
        const counts = countRes.data?.counts; // ✅ define counts first
        const countsMap = buildCountsMap(counts);


  
        // 🧠 Add commentCount to each post
        const enrichedPosts = newPosts.map((post) => ({
          ...post,
          user: post.user || null,
          originalPost: post.originalPost
            ? {
                ...post.originalPost,
                user: post.originalPost.user || null,
              }
            : null,
          commentCount: countsMap[post.id] || 0,
          category: post.category || "General",
        }));

          // 🔒 Filter out private posts unless the viewer is allowed
        const filteredPosts = enrichedPosts.filter((post) => {
          const author = post.user;
          const isPrivate = author?.privacy === 'private';
          const isOwner = author?.id === currentUser?.id;
          const isFollower = author?.isFollowedByCurrentUser;

          // 🔁 Also block private original posts if this is a retweet
          const isRepostOfPrivate =
            post.originalPost?.user?.privacy === 'private' &&
            post.originalPost?.user?.id !== currentUser?.id &&
            !post.originalPost?.user?.isFollowedByCurrentUser;

          return (!isPrivate || isOwner || isFollower) && !isRepostOfPrivate;
        });

        newPosts.forEach((post) => {
  if (!post.user) console.warn("⚠️ Post missing user:", post.id);
});
  
        setPosts((prev) => [...prev, ...filteredPosts]);
        setPostIds((prev) => new Set([...prev, ...filteredPosts.map(p => p.id)]));
        setHasMore(filteredPosts.length > 0);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching posts:", err.response?.data || err.message);
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  // Handle initial load by resetting to page 1
  useEffect(() => {
    fetchPosts(); // fetch page 1 on mount
  }, []);
  // Fetch when page or filter changes
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      fetchPosts();
    }, 300);
  }, [page, filter]);


  useEffect(() => {
    if (!hasMore || loading) return; // ✅ Fix: Allow observer setup on all pages
  
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { rootMargin: "200px" }
    );
  
    const target = document.getElementById("feed-end");
    if (target) observerRef.current.observe(target);
  
    return () => observerRef.current?.disconnect();
  }, [loading, hasMore]);

  const handleRetry = () => {
    setError(null);
    fetchPosts();
  };

  console.log("📌 Filter:", selectedCategory);
  console.log("📌 Displayed posts:", posts.map(p => ({ id: p.id, user: p.user?.username, category: p.category })));


  return (
    <div className="community-feed-container">
      <h3 className="community-feed-title">Community Feed</h3>

      {/* ✅ For you / Following tab UI */}
      <div className="feed-toggle-tabs">
        {[
          { label: "For You", emoji: "✨", key: "foryou" },
          { label: "Following", emoji: "👥", key: "following" },
        ].map(({ label, emoji, key }) => (
          <button
            key={key}
            className={`feed-toggle-tab ${["foryou", "following"].includes(filter) && filter === key ? "active" : ""}`}
            onClick={() => {
              setFilter(key);
              setPosts([]);
              setPostIds(new Set());
              setPage(1);
            }}
          >
            <span>{emoji}</span> {label}
          </button>
        ))}
      </div>


      {/* ✅ Category tab UI */}
      <div className="category-tabs">
      {["All", "🔥 Meme", "🎨 NFT", "🪙 Crypto", "🧠 DAO", "💣 On-chain Drama"].map((cat) => (
        <button
          key={cat}
          className={`category-tab ${selectedCategory === cat ? "active" : ""}`}
          onClick={() => {
            setSelectedCategory(cat);
            setPosts([]);
            setPostIds(new Set());
            setPage(1);
          }}
        >
          {cat}
        </button>
      ))}
    </div>

      {error && (
        <div className="community-feed-error" role="alert" aria-live="assertive">
          <p>{error}</p>
          <button onClick={handleRetry} className="retry-button">Retry</button> {/* ✅ #4 Retry */}
        </div>
      )}

      <PostComposer
        onPostCreated={(newPost) => {
          if (!postIds.has(newPost.id)) { // ✅ #2 avoid prepending duplicate
            setPosts((prevPosts) => [newPost, ...prevPosts]);
            setPostIds((prevIds) => new Set([newPost.id, ...prevIds]));
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      <ul className="community-feed-list">
        {posts
          .filter((post) => {
            const cleanCategory = selectedCategory.replace(/^[^\w]+/, "").trim(); // Remove emoji
            if (cleanCategory === "All") return true;
            return post.category?.toLowerCase() === cleanCategory.toLowerCase();
          })
          .map((post, index) => (
            <li key={`${post.id}-${index}`} className="community-feed-post">
              <div className="post-container">
                <Post post={post} currentUser={currentUser} setPosts={setPosts} />

                {/* 🧪 Debug Score (Only visible if .score exists) */}
                {post.score !== undefined && (
                  <p className="debug-score" style={{ color: "#999", fontSize: "12px", padding: "0 0.5rem" }}>
                    Score: {post.score.toFixed(2)}
                  </p>
                )}
              </div>
            </li>
          ))}
      </ul>


      {loading && (
        <p className="community-feed-loading" role="status" aria-live="polite">
          Loading posts...
        </p>
      )}

      <div id="feed-end"></div>

      {!hasMore && !loading && (
        <p className="community-feed-empty">No more posts to show.</p>
      )}
    </div>
  );
}

Feed.propTypes = {
  currentUser: PropTypes.object,
};

export default Feed;


/**
 * Potential Improvements:
 * 1. **Optimize API Requests**
 *    - Debounce API calls when changing filters to prevent excessive requests.
 *    - Fetch multiple pages at once to reduce frequent requests.
 *
 * 2. **Prevent Duplicate Posts**
 *    - Implement a check to avoid adding duplicate posts when new posts arrive.
 *    - Use a `Set` or a map with post IDs to track unique posts.
 *
 * 3. **Enhance Scroll Performance**
 *    - Batch fetches instead of requesting new posts on each scroll event.
 *    - Use a buffer so the next set of posts loads slightly before reaching the end.
 *
 * 4. **Improve Error Handling**
 *    - Add a retry button for failed API requests instead of just showing an error.
 *    - Show an offline mode message if the API is unreachable.
 * 
 * ✅ Improvement #1: Debounced API + batch fetch (5 → 10 posts)
 * ✅ Improvement #2: Duplicate prevention using a Set
 * ✅ Improvement #3: Scroll buffer using rootMargin
 * ✅ Improvement #4: Retry button for errors
 */