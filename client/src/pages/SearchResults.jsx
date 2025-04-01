/**
 * SearchResults.js - Displays search results for users and posts
 *
 * This file is responsible for:
 * - Fetching and displaying search results based on the query and filter.
 * - Handling pagination with infinite scrolling or a "Load More" button.
 * - Managing search state, error handling, and UI updates.
 */


import React, { useState, useEffect, useCallback, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SearchBar from "@/components/SearchBar";
import UserListItem from "@/components/Profile_components/UserListItem"; // <-- NEW
import Post from "@/components/Post_components/Post";
import Loader from "@/components/Loader";
import { api } from "@/api/apiConfig"; 
import "@/css/pages/SearchResults.css";
import { AuthContext } from "@/context/AuthContext";  

function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const urlQuery = new URLSearchParams(location.search).get("query") || "";
  const currentFilter = new URLSearchParams(location.search).get("filter") || "all";
  const { user: currentUser } = useContext(AuthContext);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState(urlQuery);

  // Clears search suggestions on component mount/update
  useEffect(() => {
    setSearchSuggestions([]);
  }, []);

  const fetchSearchResults = useCallback(
    async (page = 1) => {
      if (!searchTerm.trim()) return;

      setLoading(true);
      setErrorMessage("");

      try {
        const response = await api.get("/search", {
          params: { query: searchTerm, filter: currentFilter, page },
        });

        const rawResults = response.data.results || [];

        // Separate out posts
        const postResults = rawResults.filter((r) => r.type === "post");
        const postIds = postResults.map((p) => p.id);

        // Fetch comment counts in bulk
        const countRes = await api.post("/comments/batch-count", { postIds });
        const countsMap = {};
        countRes.data.counts.forEach(({ postId, count }) => {
          countsMap[postId] = count;
        });

        // Enrich posts with comment counts
        const enrichedResults = rawResults.map((r) =>
          r.type === "post"
            ? { ...r, commentCount: countsMap[r.id] || 0 }
            : r
        );

        if (page === 1) {
          setResults(enrichedResults);
        } else {
          setResults((prev) => [...prev, ...enrichedResults]);
        }

        setHasMore(page < (response.data.totalPages || 1));
      } catch (error) {
        console.error("Error fetching search results:", error);
        setErrorMessage("Failed to fetch search results. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, currentFilter]
  );

  // Update search results when a new query is submitted
  const handleSearch = ({ term, filter }) => {
    if (term !== searchTerm || filter !== currentFilter) {
      navigate(`/search?query=${encodeURIComponent(term)}&filter=${filter}`);
      setResults([]);
      setPage(1);
    }
  };

  // Load more for pagination
  const loadMore = () => {
    if (hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  // Fetch initial results whenever query/filter changes
  useEffect(() => {
    if (searchTerm.trim()) {
      fetchSearchResults(1);
    }
  }, [searchTerm, currentFilter, fetchSearchResults]);

  // Debounced navigation to update the URL
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim()) {
        navigate(`/search?query=${encodeURIComponent(searchTerm)}&filter=${currentFilter}`);
      }
    }, 350);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, currentFilter, navigate]);

  return (
    <div className="search-results-container">
      <h2>Search Results for "{searchTerm}"</h2>

      <SearchBar
        query={searchTerm}
        setQuery={setSearchTerm}
        onSearch={() => setSearchSuggestions([])}
        filters={["all", "posts", "users"]}
      />

      {errorMessage && (
        <div className="error-container">
          <p>{errorMessage}</p>
          <button onClick={() => fetchSearchResults(1)}>Retry</button>
        </div>
      )}

      {loading && <Loader />}

      {!loading && !results.length && !errorMessage && (
        <p className="no-results">
          No results found for "{searchTerm}". <Link to="/">Go back to home.</Link>
        </p>
      )}

      <div className="results-list">
        {results.map((result) => (
          <div key={result.id} className="result-item">
            {result.type === "user" ? (
              // NEW: Use our Twitter-style UserListItem with bio
              <UserListItem
                user={result}
                currentUserId={currentUser?.id}
                showBio={true} // <--- We'll show the bio in search
              />
            ) : (
              <Post
                post={result}
                currentUser={currentUser}
                setPosts={setResults}
              />
            )}
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="load-more">
          <button onClick={loadMore} disabled={loading}>
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchResults;

/**
 * 🔹 Potential Improvements:
 * - Implement debounced search to avoid unnecessary API calls while typing.
 * - Add error handling for network failures or API rate limits.
 * - Display user-specific recommendations when no results are found. - SKIPPED
 * - Implement infinite scrolling instead of a "Load More" button. - SKIPPED
 * - Optimize backend queries for better search performance on large datasets. - SKIPPED
 */