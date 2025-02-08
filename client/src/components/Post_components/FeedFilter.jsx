import React, { useState } from "react";
import PropTypes from "prop-types"; 
import "@/css/components/Post_components/FeedFilter.css"; 

function FeedFilter({ onFilterChange = () => {} }) { 
    const [selectedFilter, setSelectedFilter] = useState("posts");

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
    onFilterChange: PropTypes.func,
};

export default FeedFilter;