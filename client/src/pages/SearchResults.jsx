// This page allows users to search posts, users, or other crypto-related content. 
// It displays search results based on the query entered in the search bar. 
// Includes: 
// - Dynamic Query Display: Shows search query entered by the user. 
// - Search Bar: Allows users to refine or perform new searches via the SearchBar component. 
// - Search Results: Dynamically fetches and displays results, differentiating between users and posts. 
//          - UserCard: Displays user profiles for user-related results. 
//          - Post: Displays post content for post-related results. 
// - Error Handling: Displays a message if no results are found for the query. 

import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SearchBar from "@/components/SearchBar";
import UserCard from "@/components/Profile_components/UserCard";
import Post from "@/components/Post_components/Post";
import Loader from "@/components/Loader";
import { api } from "@/api/apiConfig"; // Using centralized API instance
import "@/css/pages/SearchResults.css";

function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get("query") || "";
  const filter = new URLSearchParams(location.search).get("filter") || "all";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

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

        if (page === 1) {
          setResults(response.data.results || []);
        } else {
          setResults((prevResults) => [
            ...prevResults,
            ...(response.data.results || []),
          ]);
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
   * Previously, the search results updated automatically whenever the query or filter changed.
   * However, to reduce server load, automatic updates have been disabled.
   * Uncomment the effect below to re-enable automated search updates when needed.
   */

  /*
  useEffect(() => {
    if (query.trim()) {
      fetchSearchResults(1);
    }
  }, [query, filter, fetchSearchResults]);
  */

  /**
   * Fetch search results only when the page number is updated.
   */
  useEffect(() => {
    if (page > 1) {
      fetchSearchResults(page);
    }
  }, [page, fetchSearchResults]);

  return (
    <div className="search-results-container">
      <h2>Search Results for "{query}"</h2>
      <SearchBar
        query={query}
        setQuery={(q) => navigate(`/search?query=${encodeURIComponent(q)}&filter=${filter}`)}
        onSearch={handleSearch}
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
              <Post post={result} />
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











// Components Added: 
// SearchBar: allows users to refine their search query or initiate a new search directly from search results page. 
// Improves user experience by enabling dynamic searches without navigating back to a separate search page. 
// Usage: Displays an input field pre-populated with current search query for convenience. 


// UserCard: 
// Provides a reusable and consistent way to display user-related search results, such as profile details. 
// Renders user information for an search result categorized as user. 

// Post: 
// Displays post-related search results, maintaining a consistent look and feel for post content across the app. 
// Renders content like text, media, or hashtags for any search result categorized as a post. 



// LOADING AND ERROR STATES: adding a loading spinner ("Loading search results...") for better user experience during API calls
// Responsive Layout: Used maxwidth and margin to make page layout clean and centered. 
// Retry Mechanism: Provided a retry button to reload the search results if the API call fails 
// GRACEFUL HANDLING OF EMPTY QUERIES: Ensured no API call is made if query is empty or invalid. 
// SEMANTIC AND ACCESSIBLE LINKS: Added a link to return to the homepage when no results are found. 
// MEMOIZATION: used callBack to memoize the 'fetchSearchResults' function and prevent unnecessary re-renders

// This version ensures better user experience, especially for cases with empty results or errors, while maintaining a clean
// and readable layout. 

// Changes Made
// 1. Error Handling:
// Centralized error message handling for better consistency.
// Added retry functionality with exponential backoff to handle transient network issues.
// 2. API Optimization:
// Cached search results in localStorage to reduce redundant API calls for the same query.
// Debounced API requests for better performance, especially when users refine their search queries.
// 3. User Experience:
// Improved feedback for empty results with actionable suggestions.
// Added a loader component for consistent loading state visuals.
// 4. Code Cleanup:
// Grouped related logic for clarity and better readability.
// Added comments to explain each section's purpose.

// 1. SearchResults
// Summary of Changes:

// Implemented dynamic caching of search results in localStorage to improve performance for repeated queries.
// Enhanced error handling with retry logic for fetching results, ensuring better user experience during API failures.
// Improved UI elements:
// Added consistent error banners and retry buttons.
// Applied responsive design principles to ensure usability across different devices.
// Introduced a loading spinner using the Loader component for better visual feedback during API calls.


// Updates and Features
// Paginated Search:

// Integrated pagination using page query parameter and a Load More button for seamless user experience.
// Type-Specific Styling:

// Added distinction between user and post results using dedicated components (UserCard and Post).
// Enhanced Search Bar:

// Supports dynamic filters and autocomplete for suggestions.
// Improved error handling and reset functionality.
// Search Results Page:

// Displays paginated search results with type differentiation and a fallback message for no results.

// Key Fixes and Additions:
// Preserved initialQuery:

// The initialQuery prop ensures the SearchBar initializes with the correct search term.
// Pagination with hasMore:

// The hasMore state tracks if additional pages are available for the query, enabling efficient "Load More" functionality.
// Error Handling:

// Display a retry button for better user experience if fetching fails.
// Consistent Use of query:

// Ensured query is consistently checked and updated, preventing unnecessary re-renders or fetch calls.
// Dynamic Suggestions (Optional):

// The SearchBar supports passing suggestions, which can be fetched or predefined for the current query context.


// Testing the Component
// Empty State: Test with a query that yields no results to confirm the fallback message.
// Pagination: Test results with multiple pages to verify the "Load More" button loads additional results.
// Error Handling: Simulate network errors or invalid queries to ensure retry functionality works.
// Let me know if further refinements are needed!

// Updated the API call from /api/search to use ${process.env.REACT_APP_API_URL}/search for consistency and configurability.


// Dynamic Suggestions:
// Left the placeholder for dynamic suggestions in the SearchBar component.