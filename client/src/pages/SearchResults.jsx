/**
 * SearchResults.js - Displays search results for users and posts
 *
 * This file is responsible for:
 * - Fetching and displaying search results based on the query and filter.
 * - Handling pagination with infinite scrolling or a "Load More" button.
 * - Managing search state, error handling, and UI updates.
 */


import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SearchBar from "@/components/SearchBar";
import UserCard from "@/components/Profile_components/UserCard";
import Post from "@/components/Post_components/Post";
import Loader from "@/components/Loader";
import { api } from "@/api/apiConfig"; 
import "@/css/pages/SearchResults.css";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";  


function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialQuery = new URLSearchParams(location.search).get("query") || "";
  const filter = new URLSearchParams(location.search).get("filter") || "all";
  const { user: currentUser } = useContext(AuthContext);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]); // Ensure suggestions reset

  const [searchTerm, setSearchTerm] = useState(initialQuery); // ✅ Debounced input value
  
  
  
  /**
   * Clears search suggestions when component mounts or updates.
   */
  useEffect(() => {
    setSearchSuggestions([]); // Clears suggestions on page load
  }, []);

  /**
   * Fetch search results based on the current query and page.
   */
  const fetchSearchResults = useCallback(
    async (page = 1) => {
      if (!query.trim()) return;

      setLoading(true);
      setErrorMessage("");

      try {
        const response = await api.get("/search", {
          params: { query, filter, page },
        });

        const rawResults = response.data.results || [];

        const postResults = rawResults.filter(r => r.type === "post");
        const postIds = postResults.map(p => p.id);
        const countRes = await api.post("/comments/batch-count", { postIds });

        const countsMap = {};
        countRes.data.counts.forEach(({ postId, count }) => {
          countsMap[postId] = count;
        });

        const enrichedResults = rawResults.map((result) =>
          result.type === "post"
            ? { ...result, commentCount: countsMap[result.id] || 0 }
            : result
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
    [query, filter]
  );

  /**
   * Update search results when a new query is submitted.
   */
  const handleSearch = ({ term, filter }) => {
    if (term !== query || filter !== filter) {
      navigate(`/search?query=${encodeURIComponent(term)}&filter=${filter}`);
      setResults([]); // Clear previous results when a new search is performed
      setPage(1);
    }
  };

  /**
   * Fetch the next page of results for infinite scroll or load more functionality.
   */
  const loadMore = () => {
    if (hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  /**
   * Fetches search results when query, filter, or page changes.
   */
  useEffect(() => {
    if (query.trim()) {
        fetchSearchResults(1);
    }
}, [query, filter, fetchSearchResults]);



/**
 * Debounced Navigation Effect: Updates the URL. 
 */
useEffect(() => {
  const delayDebounce = setTimeout(() => {
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm)}&filter=${filter}`);
    }
  }, 350);

  return () => clearTimeout(delayDebounce);
}, [searchTerm, filter, navigate]);



  return (
    <div className="search-results-container">
      <h2>Search Results for "{query}"</h2>
      <SearchBar
          query={searchTerm} // ✅ Controlled value
          setQuery={setSearchTerm} // ✅ Typing updates state
          onSearch={() => setSearchSuggestions([])} // ✅ Clears suggestions on search
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
          No results found for "{query}". <Link to="/">Go back to home.</Link>
        </p>
      )}

      <div className="results-list">
          {results.map((result) => (
              <div key={result.id} className="result-item">
                  {result.type === "user" ? (
                      <UserCard user={result} />
                  ) : (
                      <Post post={result} currentUser={currentUser} setPosts={setResults} />
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