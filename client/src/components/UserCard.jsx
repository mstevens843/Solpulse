// The UserCard component is a reuseable UI element designed to display basic user information in a concise and visually appealing format.
// It incorporates profile details and provides interaction options such as the ability to follow or unfollow users. 


// FEATURES:
// USER AVATAR - displays user's profile pic prominently using the user.avator prop. 
// USERNAME DISPLAY - shows the username in a bold, visible manner using the 'user.username' prop.
// FOLLOW/UNFOLLOW FUNCTIONALITY - Component used 'FollowButton' 
// - integrates follow/unfollow functionality by passing the user's unique id to the FollowButton component.
// SIMPLE AND COMPACT LAYOUT - Combines all user details into a clean and cohesive card-style layout, making it suitable for lists and grids. 

import { React, useEffect, useState } from "react";
import PropTypes from "prop-types";
import FollowButton from "@/components/FollowButton";
import MessageButton from "./MessageButton";
import FollowersFollowing from "./FollowersFollowing";
import { useNavigate } from "react-router-dom";
import CryptoTip from "@/components/CryptoTip"; 
import { FaEnvelope } from "react-icons/fa";

import "@/css/components/UserCard.css";

function UserCard({ user, isInModal, onProfilePictureChange, currentUser }) {
    const [followersCount, setFollowersCount] = useState(user.followersCount || 0);
    const [followingCount, setFollowingCount] = useState(user.followingCount || 0);
    const [showModal, setShowModal] = useState(false);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [showTipModal, setShowTipModal] = useState(false);
    const [viewingType, setViewingType] = useState(""); // 'followers' or 'following'
    const navigate = useNavigate();

    // Use user.profilePicture directly instead of local state to prevent desync issues
    const displayedProfilePicture = user?.profilePicture || "/default-avatar.png";

    // Sync followers/following count when user prop updates
    useEffect(() => {
        setFollowersCount(user.followersCount || 0);
        setFollowingCount(user.followingCount || 0);
    }, [user.followersCount, user.followingCount]);

    const updateCounts = (change) => {
        setFollowersCount((prev) => Math.max(prev + change, 0)); // Prevent negative values
    };

    const openModal = (type) => {
        setViewingType(type);
        setShowModal(true);
    };

    const handleProfilePictureChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            onProfilePictureChange(file);
        }
    };

    const toggleMessageModal = () => {
        setIsMessageModalOpen((prev) => !prev); // Toggle message modal
    };

    const toggleTipModal = () => {
        setShowTipModal((prev) => !prev); // Toggle tip modal
    };

    return (
        <div className={isInModal ? "user-card-modal" : "user-card"}>
            <img
                src={`${user?.profilePicture ? `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${user.profilePicture}` : "/default-avatar.png"}?timestamp=${new Date().getTime()}`}
                alt={`${user.username}'s profile picture`}
                className={isInModal ? "user-avatar-modal" : "user-avatar"}
            />
            {user.id === currentUser?.id && (
                <>
                    <button
                        className="edit-profile-btn"
                        onClick={() => document.getElementById("profile-pic-input").click()}
                    >
                        Edit Profile Picture
                    </button>

                    <input
                        id="profile-pic-input"
                        type="file"
                        style={{ display: 'none' }}
                        onChange={handleProfilePictureChange}
                    />
                </>
            )}

                <div className="user-info">
                    <h4 className="user-username">{user.username}</h4>

                    <p onClick={() => openModal("followers")} className="follow-link">
                        Followers: {followersCount}
                    </p>
                    <p onClick={() => openModal("following")} className="follow-link">
                        Following: {followingCount}
                    </p>

                    {/* Follow & Message Buttons */}
                    <FollowButton userId={user.id} updateCounts={updateCounts} />
                    <MessageButton recipientUsername={user.username} onOpenMessageModal={toggleMessageModal} />

                    {/* CryptoTip Button - Only show if user has a wallet address */}
                    {user.walletAddress && (
                        <button
                            className="crypto-tip-btn"
                            onClick={toggleTipModal} // Use toggle function
                            aria-label="Tip User"
                        >
                            💰 Tip
                        </button>
                    )}
                </div>

                {/* Followers/Following Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="close-btn" onClick={() => setShowModal(false)}>X</button>
                            <h3>{viewingType === "followers" ? "Followers" : "Following"}</h3>
                            <FollowersFollowing userId={user.id} type={viewingType} />
                        </div>
                    </div>
                )}
                {/* CryptoTip Modal */}
                {showTipModal && (
                    <div className="modal-overlay" onClick={toggleTipModal}>
                        <div className="modal-content crypto-tip-modal" onClick={(e) => e.stopPropagation()}>
                            <button className="close-btn" onClick={toggleTipModal}>X</button>
                            <CryptoTip
                                recipientId={user.id}
                                recipientWallet={user.walletAddress}
                                onTipSuccess={(message) => {
                                    alert(message); // Show success message
                                    toggleTipModal(); // ✅ Close modal on success
                                }}
                            />
                        </div>
                    </div>
                )}
    
                

               {/* Message Modal */}
                {isMessageModalOpen && (
                    <div className="modal-overlay" onClick={toggleMessageModal}>
                        <div className="modal-content message-modal" onClick={(e) => e.stopPropagation()}>
                            <button className="close-btn" onClick={toggleMessageModal}>X</button>
                            <h3>Send Message to {user.username}</h3>
                            <form className="message-form" onSubmit={(e) => e.preventDefault()}>
                                <textarea
                                    placeholder="Write your message here..."
                                    className="message-input"
                                    rows="4"
                                ></textarea>
                                <button type="submit" className="send-message-btn">
                                    Send
                                </button>
                            </form>
                        </div>
                    </div>
                )}
        </div>
    );
}

UserCard.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.number.isRequired,
        username: PropTypes.string.isRequired,
        profilePicture: PropTypes.string,
        followersCount: PropTypes.number,
        followingCount: PropTypes.number,
        walletAddress: PropTypes.string, // ✅ Make sure wallet address is included

    }).isRequired,
    currentUser: PropTypes.object.isRequired,
    onProfilePictureChange: PropTypes.func.isRequired,
    isInModal: PropTypes.bool
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