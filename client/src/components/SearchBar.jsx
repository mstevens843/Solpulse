/**
 * SearchBar.js
 * 
 * This file is responsible for handling the search functionality within SolPulse.
 * It provides a real-time search bar with autocomplete suggestions and supports 
 * filtering by different categories (e.g., posts, users, topics).
 */


import React, { useState, useEffect, useCallback } from "react";
import debounce from "lodash.debounce";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/apiConfig";
import "@/css/components/SearchBar.css"; 

function SearchBar({ query, setQuery, filters = [] }) {
    const [errorMessage, setErrorMessage] = useState("");
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState(filters[0] || "all");
    const [isTyping, setIsTyping] = useState(false); // Track if user is typing
    const navigate = useNavigate();

    /**
     * Debounced API call for fetching search suggestions.
     * Prevents excessive API calls while user is typing.
     */
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


     /**
     * Trigger suggestion fetching when user is typing.
     * Ensures debounce function is properly executed.
     */
    useEffect(() => {
        if (isTyping) {
            fetchSuggestions(query);
        }
    }, [query, selectedFilter, isTyping, fetchSuggestions]);


    /**
     * Handles search submission.
     * - Prevents submission if query is empty.
     * - Clears suggestions after submission.
     */
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!query.trim()) {
            setErrorMessage("Please enter a search term.");
            return;
        }
        setIsTyping(false); // Stops suggestions from showing
        setSearchSuggestions([]); // Clears suggestions
        navigate(`/search?query=${encodeURIComponent(query)}&filter=${selectedFilter}`);
    };


    /**
     * Handles selection of a search suggestion.
     * - Sets the query to the selected suggestion.
     * - Clears suggestions and redirects to search results.
     */
    const handleSuggestionClick = (suggestion) => {
        const selectedQuery = suggestion.username || suggestion.content;
        setQuery(selectedQuery);
        setSearchSuggestions([]); // Clears suggestions immediately
        setIsTyping(false); // Stops showing suggestions
        navigate(`/search?query=${encodeURIComponent(selectedQuery)}&filter=${selectedFilter}`);
    };


    /**
     * Resets search input, suggestions, and error messages.
     */
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
                            setIsTyping(true); // Only show suggestions when typing
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

/**
 * Potential Improvements:
 * - Implement caching to reduce duplicate API calls for the same query.
 * - Enhance filtering logic to support additional categories dynamically.
 * - Improve error handling by displaying a fallback message when API requests fail.
 */