// The Hashtag component provides a reusable interface for rendering hashtags within posts. 
// Includes:
// Clickable Links: Converts hashtags into clickable links that navigate to a page for searching or filtering posts related to the tag. 
// Dynamic Navigation: Uses React Router's Link to direct users to /hashtag{tag}, enabling seamless filtering or exploration of tagged content. 
// Customizable Display: Styles hashtags using the 'hashtag' class, making them visually distinc and user friendly. 

// This component enhances post interactivit by allowing users to explore related topics easily.

import React from "react";
import PropTypes from "prop-types"; // For prop validation
import { Link } from "react-router-dom";
import "@/css/components/Post_components/Hashtag.css"; // Updated alias for CSS import

function Hashtag({ tag }) {
    // Ensure tag is a string and trim spaces
    const trimmedTag = typeof tag === "string" ? tag.trim() : "";

    if (!trimmedTag || trimmedTag.length > 50) {
        console.error("Invalid or too long tag provided to Hashtag component:", tag);
        return null;
    }

    return (
        <Link
            to={`/hashtag/${encodeURIComponent(trimmedTag)}`}
            className="hashtag"
            aria-label={`View posts tagged with ${trimmedTag}`}
        >
            #{trimmedTag}
        </Link>
    );
}

Hashtag.propTypes = {
    tag: PropTypes.string.isRequired, // Prop validation to ensure `tag` is a string
};

export default Hashtag;





// Pages where the 'Hashtag' component is Implemented: 

// Explore Page: why: Explor page focuses on trending topics and posts. Including the Hashtag component makes it easier for users to navigate and filter
// based on hashtags. 
// Reference: Used in trending posts or topics to encourage users to discover related content. 

// Homepage: 
// why: Home page dispayed feed of posts, and hashtags are needed under posts. 
// Reference: Appears within posts rendered in the feed. 

// Profile Page
// why: Post in a user's profile may include hashtags, The hashtag component allows others to explore rleated content directly from the profile. 

// DASHBOARD PAGE: 
// WHY: The Dashboard integrates a feed, recent messages, and other data. The Hashtag component enhances the feed by linkinh hashtags to related topics. 
// Reference: Embedded in the feed for posts. 

// SEARCH RESULTS PAGE: 
// WHY: If the search results include posts with hashtags, hashtag component will allow users to refine their search or discover related posts. 
// by clicking the tags. 
// Reference: Used in posts displayed as search results


// Improvements Made:
// Validation for the 'tag' prop: Add validation to ensure tag is a non-empty string
// CSS Improvements: Provide default or additional styling to hashtags/ 
// Handle Special Characters: Encode tag in URL to handle spaces or special characters/ 
// Add 'aria-label' or screen readers to improve accessibility
// Added basic error handling incase 'tag' is undefined or improperly passed. 