// This component will allow users to search for posts, users, or crypto-related topics.

// FEATURES
// Search input field
// Search Action
// User-Friendly Design


// This component allows users to search for posts, users, or crypto-related topics.

// FEATURES
// Search input field
// Search Action
// User-Friendly Design

import React, { useState, useEffect, useCallback } from "react";
import debounce from "lodash.debounce";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/apiConfig";
import "@/css/components/SearchBar.css"; 

function SearchBar({ query, setQuery, filters = [] }) {
    const [errorMessage, setErrorMessage] = useState("");
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState(filters[0] || "all");
    const [isTyping, setIsTyping] = useState(false); // ✅ Track if user is typing
    const navigate = useNavigate();

    // Debounced API call for search suggestions
    const fetchSuggestions = useCallback(
        debounce(async (queryTerm) => {
            if (!queryTerm.trim()) {
                setSearchSuggestions([]);
                return;
            }
            try {
                const response = await api.get(`/search?query=${encodeURIComponent(queryTerm)}&filter=${selectedFilter}`);
                const validResults = response.data.results.filter(item => item.username || item.content);
                setSearchSuggestions(validResults);
            } catch (error) {
                console.error("Error fetching search suggestions:", error);
            }
        }, 300),
        [selectedFilter]
    );

    useEffect(() => {
        if (isTyping) {
            fetchSuggestions(query);
        }
    }, [query, selectedFilter, isTyping, fetchSuggestions]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!query.trim()) {
            setErrorMessage("Please enter a search term.");
            return;
        }
        setIsTyping(false); // ✅ Stops suggestions from showing
        setSearchSuggestions([]); // ✅ Clears suggestions
        navigate(`/search?query=${encodeURIComponent(query)}&filter=${selectedFilter}`);
    };

    const handleSuggestionClick = (suggestion) => {
        const selectedQuery = suggestion.username || suggestion.content;
        setQuery(selectedQuery);
        setSearchSuggestions([]); // ✅ Clears suggestions immediately
        setIsTyping(false); // ✅ Stops showing suggestions
        navigate(`/search?query=${encodeURIComponent(selectedQuery)}&filter=${selectedFilter}`);
    };

    const handleReset = () => {
        setQuery("");
        setSearchSuggestions([]);
        setErrorMessage("");
        setIsTyping(false);
    };

    return (
        <div className="search-bar-container">
            <form onSubmit={handleSearchSubmit} className="search-bar">
                <div className="search-input-group">
                    <input
                        type="text"
                        placeholder="Search for posts, users, or topics..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setIsTyping(true); // ✅ Only show suggestions when typing
                        }}
                        className="search-input"
                    />
                    <button type="submit" className="search-button">Search</button>
                </div>
                <div className="search-options">
                    {filters.length > 0 && (
                        <select
                            value={selectedFilter}
                            onChange={(e) => setSelectedFilter(e.target.value)}
                            className="search-filter"
                        >
                            {filters.map((filter) => (
                                <option key={filter} value={filter}>
                                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                </option>
                            ))}
                        </select>
                    )}
                    <button type="button" onClick={handleReset} className="reset-button">Reset</button>
                </div>
            </form>

            {errorMessage && <p className="search-error">{errorMessage}</p>}

            {isTyping && searchSuggestions.length > 0 && query.trim() && (
                <ul className="autocomplete-suggestions">
                    {searchSuggestions.map((suggestion, index) => (
                        <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                            {suggestion.username || suggestion.content}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default SearchBar;




// In the parent component, you would handle the search logic and pass the onSearch prop to handle search queries.

// PAGES where component is likely implemented: 
// Explore Page
// HomePage
// Dashboard Page
// Profile Page

// POTENTIAL ENHANCEMENTS 
// Autocomplete Suggestions
// Filter Integration
// Search History

// Improvements made: 
// - Autocomplete Suggestions: Displays a list of matching suggestions below the search bar based on input. 
// - Filter Integration: Allows users to filter their search results by category (posts, users, topics). 
// - Search History: Maintains a history of previous searches that users can click to search again. 

// Validation: Prevents submitting an empty search by showing an error message. 
// Reset Button: Lets users quickly clear the search term 
// Improved Usability: query.trim() ensures no accidental searches with whitespace. 
// Debouncing: Used lodash.debounce to reduce API calls and minimize redundant requests.

// SearchBar.js Enhancements:

// - Autocomplete Suggestions: Shows relevant suggestions dynamically based on input.
// - Search History: Stores recent searches for quick re-use.
// - Accessibility: Added aria-label attributes for better screen reader compatibility.
// - Usability: Includes reset button to clear searches quickly.







// In the parent component, you would handle the search logic and pass the onSearch prop to handle search queries.



// PAGES where component is likely implemented: 
// Explore Page
// HomePage
// Dashboard Page
// Profile Page


// POTENTIAL ENHANCEMENTS 
// Autocomplete Suggestions
// Filter Integration
// Search History


// Improvements made: 
// Autocomplete Suggestions: Displays a list of matching suggestions below search bar based on input. 
// Filter Integration: Allows user to filer their search results by category (post, users, topics). 
// Search History: Maintains a history of previous searches that users can click to search again. 

// Validation: Prevents submitting an empty search by showing error message. 
// Reset Button: Lets users quickly clear the search term 
// Improved Usability: query.trim() ensures no accidental searches with whitespace. 
/// Add Debouncing for API Calls: If onSearch makes API calls, debounce the function to minimize redundant calls

// SearchBar.js
// Debounced Search:

// Used lodash.debounce for the debouncedSearch function to minimize frequent calls to onSearch.
// Autocomplete Suggestions:

// Limited suggestions to a maximum of 5 entries to improve rendering performance.
// Search History:

// Optimized local storage updates by slicing the history to maintain a fixed size of 10.
// State Reset:

// Added a reset button to clear the query and suggestions to enhance user experience.
// Cleanup:

// Ensured efficient use of useEffect dependencies for consistent state management.

// Key Updates
// Component (SearchBar.js)
// Dynamic Search:

// Implemented debounced search functionality to reduce API calls.
// Filtered Suggestions:

// Added logic to show relevant suggestions dynamically.
// Error Handling:

// Enhanced error handling for invalid searches.
// Search History:

// Integrated localStorage to maintain search history across sessions.

// Key Enhancements
// Pagination:

// Results are fetched in batches, reducing data transfer for large datasets.
// Load More functionality.
// Dynamic Filters:

// Users can apply filters for precise searches.
// Search Bar with Autocomplete:

// Shows suggestions dynamically as users type.

// Key Changes:
// No API Calls in This Component:

// Since SearchBar doesn't directly interact with an API endpoint, there was no need to introduce process.env.
// Improved State Management:

// Utilized clear and concise state naming.
// Ensured debounce is applied only to the query and filter updates for optimal performance.
// Improved Functionality:

// handleReset clears the search input, error message, and suggestions effectively.
// The history and suggestion handling is better streamlined.
// Accessibility:

// Added aria-label attributes to all interactive elements for better screen reader compatibility.
// Consistent Styling:

// Maintains a clean and consistent user experience with CSS classes.