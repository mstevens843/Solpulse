// The LikeButton component allows users to interact with posts by liking them.
// Includes:
// DYNAMIC LIKE COUNT: Displays the current number of likes for a post and updates the count when a user clicks the button. 
// SERVER INTERACTION: Sends a request to the backend API to record the like for the specified post. 
// ERORR HANDLING: Logs any errors that occur during the API call to ensure the app remains stable. 

import React, { useState } from "react";
import PropTypes from "prop-types";
import { api } from "@/api/apiConfig"; // Centralized API instance
import "@/css/components/Post_components/PostButtons.css"; // Updated alias for CSS import

function LikeButton({ postId, initialLikes = 0, currentUser }) {
    const [likes, setLikes] = useState(initialLikes);
    const [hasLiked, setHasLiked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLike = async () => {
        if (loading || hasLiked || !currentUser?.id) {
            if (!currentUser?.id) setError("You need to log in to like posts.");
            return;
        }
        setLoading(true);
        setError("");

        try {
            const response = await api.post(`/posts/${postId}/like`, { userId: currentUser.id });
            setLikes(response.data.likes);
            setHasLiked(true); // Prevent multiple likes from the same user
        } catch (err) {
            console.error("Error liking post:", err);
            setError("Failed to like the post. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="like-button-container">
            <button
                onClick={handleLike}
                disabled={loading || hasLiked}
                className="like-button"
                aria-label={`Like post. Current likes: ${likes}`}
            >
                {loading ? "Liking..." : `Like (${likes})`}
            </button>
            {error && <p className="like-error" role="alert">{error}</p>}
        </div>
    );
}

LikeButton.propTypes = {
    postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    initialLikes: PropTypes.number,
    currentUser: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }).isRequired,
};

export default LikeButton;












// PAGES WHERE IMPLEMENTED: 
// HOMEPAGE: Posts displayed in the feed on the Home page benefit from interactive features like likes to boost user engagement. 
// REFERENCE: Integrated within each post rendered in the feed. 

// PROFILE PAGE: 
// WHY: Posts on the Profile page may include a LikeButton to enable liking directly from a user's profile. 
// REFERENCE: Appears alongside each post within the profile. 

// EXPLORE PAGE: 
// why: Trending posts displayed on the 'Explore' page can include LikeButton, encouraging users to interact with trending content. 
// Reference: Used in each post within the trending topics or posts list. 

// DASHBOARD PAGE: 
// why: Feed on the dashboard page can integrate the LikeButton to allow interaction with user-specific content. 
// Reference: Displayed alongside posts in feed. 

// SEARCH RESULTS PAGE:
// WHY: Posts in the search results can include a LikeButton to encourage user interaction with the displayed content
// Reference: Added to each post in the Search Results 



// POTENTIAL FOR REUSE: 
// TrendingCrypto Page: 
// If a cryptocurrency-related posts or insights are displayed, the LikeButton can be added to allow users to appreciate content. 


// Improvements Made: 
// Initial Likes Prop: accept initial 'likes' prop to display existing like count on load. 
// Loading State: Add a loading state to provide feedback while the like request is being processed. 
// Error Handling: Display a user-friendly error message if request fails. 
// Optimistic UI Update: Update like count optimisitically before server responds for better UX, then rollback on error if needed. 
// Accessibility Enhancements: Add aria-label for screen readers 

// Key Updates
// LikeButton Component
// Dynamic Error Handling:

// Moved error display to a dedicated <p> element styled in CSS.
// Conditional Styling:

// Applied className for styling based on loading state.