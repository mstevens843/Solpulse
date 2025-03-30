/**
 * This component provides filtering options for the feed.
 * Users can filter content by posts, crypto transactions, or media.
 *
 * Features:
 * - Uses local state (`selectedFilter`) to track the current selection.
 * - Calls `onFilterChange` to notify the parent component when the filter changes.
 * - Implements an accessible `<select>` element for better usability.
 */


import React, { useState } from "react";
import PropTypes from "prop-types"; 
import "@/css/components/Post_components/FeedFilter.css"; 

function FeedFilter({ onFilterChange = () => {} }) { 
    const [selectedFilter, setSelectedFilter] = useState("posts");


    /**
     * Handles changes in the filter selection.
     * - Updates the local state (`selectedFilter`).
     * - Notifies the parent component via `onFilterChange`.
     */

    const handleFilterChange = (e) => {
        const filterValue = e.target.value;
        setSelectedFilter(filterValue);
        onFilterChange(filterValue); 
    };

    return (
        <div className="feed-filter-container">
            <label htmlFor="filter" className="feed-filter-label">
                Filter by:
            </label>
            <select
                id="filter"
                value={selectedFilter}
                onChange={handleFilterChange}
                className="feed-filter-select"
                aria-label="Filter feed by category"
            >
                <option value="posts">Posts</option>
                <option value="crypto">Crypto Transactions</option>
                <option value="media">Media</option>
            </select>
        </div>
    );
}

FeedFilter.propTypes = {
    onFilterChange: PropTypes.func, // Function to handle filter selection changes
};

export default FeedFilter;


/**
 * // SKIPPED ALL POTENTIAL IMPROVEMENTS
 * Potential Improvements:
 * 1. **Make Filters Configurable**
 *    - Allow the parent component to define available filter options dynamically.
 *    - Accept an `options` prop to pass custom filters.
 *
 * 2. **Improve UI Feedback**
 *    - Highlight the selected filter visually beyond the default `<select>` styling.
 *    - Add icons next to filter options for better recognition.
 *
 * 3. **Enhance Accessibility**
 *    - Consider adding a keyboard shortcut to quickly switch filters.
 *    - Provide a live announcement of the selected filter for screen readers.
 */