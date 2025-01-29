import React, { useState } from "react";
import PropTypes from "prop-types";
import "@/css/components/Post_components/PostButtons.css"; // Updated alias for CSS import
import { api } from "@/api/apiConfig"; // Centralized API instance
import { toast } from "react-toastify";

function RetweetButton({ postId, initialRetweets = 0, currentUser, onRetweet }) {
    const [retweetCount, setRetweetCount] = useState(initialRetweets);
    const [hasRetweeted, setHasRetweeted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRetweet = async () => {
        if (loading || hasRetweeted || !currentUser?.id) {
            if (!currentUser?.id) toast.error("You need to log in to retweet posts.");
            return;
        }
    
        setLoading(true);
        try {
            const response = await api.post(`/posts/${postId}/retweet`, { userId: currentUser.id });
            
            // Update retweet count immediately in UI
            setRetweetCount((prev) => prev + 1);
            setHasRetweeted(true);

            // Notify parent component to update the posts feed
            if (onRetweet) {
                onRetweet({
                    id: postId,
                    userId: currentUser.id,
                    createdAt: post.createdAt,  // Keep original post creation time
                    retweetedAt: new Date().toISOString(),
                    originalUser: currentUser.username,
                    isRetweet: true,
                });
            }

            toast.success("Post retweeted successfully!");
        } catch (err) {
            console.error("Error retweeting post:", err);
            toast.error("Failed to retweet the post.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="retweet-button-container">
            <button
                onClick={handleRetweet}
                disabled={loading || hasRetweeted}
                className="retweet-button"
                aria-label={`Repost post. Current reposts: ${retweetCount}`}
            >
                {loading ? "Reposting..." : `Repost (${retweetCount})`}
            </button>
        </div>
    );
};

RetweetButton.propTypes = {
    postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    initialRetweets: PropTypes.number,
    currentUser: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        username: PropTypes.string.isRequired,
    }).isRequired,
    onRetweet: PropTypes.func.isRequired,
};

export default RetweetButton;











// PAGES WHERE COMPONENT IS LIKELY IMPLEMENTED: 
// HOMEPAGE
// EXPLORE PAGE
// PROFILE PAGE
// DASHBOARD PAGE

// Improvements made: 
// Loading State Management: prevents multiple submissions. Provides feedback during post creation process. 
// Error Display: shows user friedly error message if API call fails. 
// Feedback on success: replaces 'alert' with in-app success message. 
// Added aria-label to button for better screen reader support. 

// RetweetButton.js
// Single State for Feedback:

// Combined errorMessage and successMessage into a single statusMessage state to simplify logic.
// Conditional Styling:

// Added conditional styles for success and error messages for better user experience.
// Optimization:

// Reduced state updates during API calls by batching updates.

// RetweetButton Component
// Status Message:

// Moved the message (statusMessage) into styled <p> elements (retweet-error or retweet-success) based on the success or failure of the operation.
// Improved Accessibility:

// Added aria-busy for screen readers to indicate loading state.

// Environment Variable for API URL:

// Changed the endpoint to use process.env.REACT_APP_API_URL for consistency across all API calls.
// javascript
// Copy code
// const API_URL = process.env.REACT_APP_API_URL;
// Styling and Accessibility:

// Added aria-busy to the button to indicate a loading state to assistive technologies.
// Retained aria-label for clear accessibility.
// Error Handling:

// Status messages dynamically change the class to indicate success (retweet-success) or failure (retweet-error).
