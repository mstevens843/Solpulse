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