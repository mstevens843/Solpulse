// FollowButton component provides users with a siple and reusable interface to follow or unfollow other users. 
// Includes:
// DYNAMIC STATE: Tracks whether the current user is following the target user (isFollowing state).
// TOGGLE ACTION: Sends an API request to follow or unfollow the target user based on the current state. 
// USER INTERACTION: Displays a button dynamically labled as "Follow" or "Unfollow" to reflect the current relationship status

// The component enhances user engagement by enabling quick and seamless interaction with other users. 



import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { api } from "@/api/apiConfig"; // Updated to use centralized API config
import Loader from "@/components/Loader"; // Updated alias for Loader component
import "@/css/components/FollowButton.css"; // Updated alias for CSS import

const FollowButton = React.memo(({ userId }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchFollowStatus = async () => {
            try {
                const response = await api.get(`/users/${userId}/is-following`); // Using `api`
                setIsFollowing(response.data.isFollowing);
            } catch (error) {
                console.error("Error fetching follow status:", error);
                setErrorMessage("Failed to load follow status.");
            }
        };

        fetchFollowStatus();
    }, [userId]);

    const toggleFollow = async () => {
        if (loading) return;

        setLoading(true);
        setErrorMessage("");
        try {
            if (isFollowing) {
                await api.post(`/users/${userId}/unfollow`); // Using `api`
            } else {
                await api.post(`/users/${userId}/follow`); // Using `api`
            }
            setIsFollowing((prev) => !prev);
        } catch (error) {
            console.error("Error toggling follow:", error);
            setErrorMessage("Failed to update follow status.");
        } finally {
            setLoading(false);
        }
    };

    const buttonLabel = isFollowing ? "Unfollow" : "Follow";

    return (
        <div className="follow-button-container">
            <button
                className={`follow-button ${isFollowing ? "is-following" : ""}`}
                onClick={toggleFollow}
                disabled={loading}
                aria-label={buttonLabel}
                aria-busy={loading}
            >
                {loading ? <Loader size="small" /> : buttonLabel}
            </button>
            {errorMessage && (
                <p className="follow-error" aria-live="polite">
                    {errorMessage}
                </p>
            )}
        </div>
    );
});

FollowButton.propTypes = {
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default FollowButton;







// Pages where FollowButton is Implemented: 
// Profile Page: why: on the Profile page, the FollowButton allows users to follow or unfollow the profile owner directly. 
// Dashboard Page: why: The dashnoard includes user-specific data and connections. The FollowButton
// Search Results Page: why: The 'Search Results' page includes user-related results (via UserCard). The FollowButton enables users to follow 
// or unfollow directly from the results. 
// Reference: Typically intergrated into each UserCard to provide instant follow/unfollow functionaility.


// Key Updates:
// Correct Route Paths:

// GET /api/users/:id/is-following → Check follow status.
// POST /api/users/:id/follow → Follow a user.
// POST /api/users/:id/unfollow → Unfollow a user.
// Fetch Follow Status:

// Added useEffect to fetch the current follow status when the component mounts.
// State Management:

// Updates isFollowing state dynamically when the follow/unfollow API is called.
// Error Handling:

// Logs any API errors to the console.

// Key Updates
// Functional Updates (FollowButton Component)
// Dynamic Classes:

// Added conditional className (is-following) for better styling management based on follow status.
// Accessibility:

// Added aria-label for screen reader users.
// Disabled State:

// Prevented multiple API calls by disabling the button during processing.


// Your FollowButton component is concise and functional. Below is a detailed review and minor suggestions to improve robustness, maintainability, and accessibility.

// Suggestions for Improvement:
// Error Handling:

// Add user-facing error messages if fetching follow status or toggling follow fails. Right now, errors are logged to the console, but the user doesn’t see feedback.
// Loading State Styling:

// If the button shows Processing..., you may want to visually indicate the loading state, such as disabling the button or adding a spinner.
// Accessibility:

// You’ve already included an aria-label, which is great! Consider ensuring the button’s text also dynamically describes its state to make it even clearer.
// Prop Validation:

// Your userId prop validation is good, but ensure backend endpoints support both string and number IDs.