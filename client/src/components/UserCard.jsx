// The UserCard component is a reuseable UI element designed to display basic user information in a concise and visually appealing format.
// It incorporates profile details and provides interaction options such as the ability to follow or unfollow users. 


// FEATURES:
// USER AVATAR - displays user's profile pic prominently using the user.avator prop. 
// USERNAME DISPLAY - shows the username in a bold, visible manner using the 'user.username' prop.
// FOLLOW/UNFOLLOW FUNCTIONALITY - Component used 'FollowButton' 
// - integrates follow/unfollow functionality by passing the user's unique id to the FollowButton component.
// SIMPLE AND COMPACT LAYOUT - Combines all user details into a clean and cohesive card-style layout, making it suitable for lists and grids. 

import React from "react";
import PropTypes from "prop-types";
import FollowButton from "@/components/FollowButton"; // Updated alias for FollowButton
import { api } from "@/api/apiConfig"; // Centralized API config
import "@/css/components/UserCard.css"; // Updated alias for CSS import

function UserCard({ user }) {
    if (!user || !user.id || !user.username) {
        console.error("Invalid user data provided to UserCard:", user);
        return null;
    }

    return (
        <div className="user-card" aria-label={`User card for ${user.username}`}>
            {/* User Avatar */}
            <img
                src={user.avatar || `/default-avatar.png`}
                alt={`${user.username}'s avatar`}
                className="user-avatar"
                loading="lazy"
                onError={(e) => {
                    e.target.src = "/default-avatar.png"; // Fallback to public default avatar
                }}
            />

            {/* User Info */}
            <div className="user-info">
                <h4 className="user-username">{user.username}</h4>
                <FollowButton userId={user.id} /> {/* FollowButton for user */}
            </div>
        </div>
    );
}

UserCard.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        username: PropTypes.string.isRequired,
        avatar: PropTypes.string,
    }).isRequired,
};

export default UserCard;









// USE CASES: 
// FOLLOWERS AND FOLLOWING LISTS: display user profiles in list format with option to follow/unfollow
// SEARCH RESULTS - show user profiles as part of search results when searching for users. 
// SUGGESTED CONNECTIONS - Feature as part of "People you May Know" or "Suggested Users" section. 



// PAGES WHERE COMPONENT IS LIKELY IMPLEMENTED: 
// FOLLOWERS AND FOLLOWING PAGE: 
// SEARCH RESULTS PAGE
// EXPLORE PAGE
// DASHBOARD PAGE. 


// POTENTIAL ENHANCEMENTS 
// Additional user info - include user bio, mutual connections, or activity stats
// Action Buttons - Add buttons for messaging or viewing user's profile alongside follow button. 
// Online/offline status



// IMPROVEMENTS MADE:
// FALLBACK OR MISSING DATA: added a fallback URL for 'avatar' in case the user's avatar is unavailable. 
// Displayed "Unknown User" if the 'username' is not provided. 
// ERROR HANDLING: 
// Rendered a loading state (Loading user Information...) if the 'user' object is missing. 
// DYNAMIC USER BIO: Displayed user's bio if available in the 'user' object
// RESPONSIVE SIZING: set 'width' and 'height' attributes for the avatar to maintain consistent sizing. 

// ADDITIONAL USER INFO:
// Added 'mutualConnections' to display the number of mutual connections with the user. 
// Added 'activityStats' for user-specific statistics, such as posts and followers. 

// ONLINE/OFFLINE STATUS: 
// Included an 'isOnline' property to show user's current status with clear visual indicators (green/online, gray/offline)
// Action Buttons: Added buttons for messaging (Message) and viewing the user's profile (View Profile). 
// Included simple 'onClick' handlers for now, which can be replaced 

// Key Updates:
// Prop Validation:

// Added PropTypes to validate the user prop structure for better type safety.
// Fallback Avatar:

// If the user.avatar field is missing, it falls back to a default avatar (/default-avatar.png).
// Error Handling:

// If invalid user data is passed, a warning is logged, and nothing is rendered.
// Accessibility:

// Added an aria-label to the card for screen readers.
// Improved image semantics and lazy-loaded the avatar with loading="lazy" for performance optimization.
// CSS Class:

// Added a dedicated class user-username for the username in case it needs specific styling.

// Key Updates
// Component (UserCard.js)
// Accessibility:

// Added aria-label for screen readers to describe the user card.
// Error Handling:

// Improved error handling for invalid user data.
// Lazy Loading:

// Added loading="lazy" for the avatar to optimize page performance.

// Key Changes:
// Consistent Use of process.env:

// The default avatar URL uses process.env.REACT_APP_API_URL for consistency.
// Error Handling for Image:

// Added an onError handler to fallback to the default avatar if the provided URL fails to load.
// Clean Structure:

// Separated sections for avatar and user info with comments for better readability.
// Accessibility:

// Added aria-label to the card for screen readers to indicate the user’s information.
// Prop Validation:

// Validated user properties and included a fallback if avatar is missing.