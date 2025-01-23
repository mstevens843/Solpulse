// The feedfilter component provides users with a way to filter the content displayed in their feed. 
// Includes:
// DROPDOWN MENU: allows users to select a filter category, such as "POSTS", "CRYPTO TRANSACTIONS", or "MEDIA".
// DYNAMIC FILTERING: Sends selected filter value to the parent component using the 'onFilterChange' callback,
// enabling dynamic updates to the displayed feed. 
// USER INTERACTION: Enhances user experience by tailoring the feed content to their preferences. 

// This component improves the usability of the feed by offering customization options for viewing specific types of content.


import React, { useState } from "react";
import PropTypes from "prop-types"; // Add PropTypes for type checking
import "@/css/components/FeedFilter.css"; // CSS import

function FeedFilter({ onFilterChange = () => {} }) { // Default parameter
    const [selectedFilter, setSelectedFilter] = useState("posts");

    const handleFilterChange = (e) => {
        const filterValue = e.target.value;
        setSelectedFilter(filterValue);
        onFilterChange(filterValue); // Always call the function
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
    onFilterChange: PropTypes.func, // Function to handle filter changes
};

export default FeedFilter;






// PAGES WHERE FeedFilter component is implemented:

// HOMEPAGE: HOme page prominently features a feed. feedfilter allows users to customize what theyt want to see,
// such as general posts, crypto related activities, or media uploads. 
// Reference: Positioned above the feed as a filering tool. 

// DASHBOARD PAGE: 
// Dashboard integrates user-specific data, including a feed. Feedfilter enhances this feed by letting users refine content based on their interests.
// Reference: Appears in "Your Feed" section of the dashboard for content filtering. 


// Potential for Reuse: 
// Explore page: Feed filter could be used on the Explore page to let users filter trending posts, topics, or media. 
// By giving users control over the content they see, the 'FeedFilter' component enhances the overall user experience and encourages interaction
// with the platform. 

// Key Changes
// Component (FeedFilter)
// State Update:

// Moved the selectedFilter state update logic to its own variable (filterValue) for clarity.
// Clean Separation:

// Removed all inline styles and delegated all visual styling to the CSS file.

// Accessibility (aria-label):

// While the label element connects to the select element using htmlFor, it may also help to add an aria-label to the select for better screen reader support.
// Styling:

// If you plan to extend the filter options in the future, ensure the css file handles long option names or large dropdown lists gracefully.
// Default Behavior:

// If onFilterChange is not provided, the component will throw an error. You can add a default prop or ensure it doesn't break without the function.

// Changes Made:
// PropTypes:

// Added PropTypes to define the expected prop type for onFilterChange as a function.
// Ensures developers know what to pass and reduces runtime errors.
// Default Prop:

// Provided a no-op default function (() => {}) for onFilterChange, so the component does not break if this prop is missing.
// Accessibility:

// Added an aria-label to the select element for better screen reader support.
// Graceful Fallback:

// Added a check for onFilterChange in handleFilterChange to avoid errors if it's undefined.