/**
 * UserCard.js
 *
 * This file is responsible for rendering a user's profile card, displaying key details such as:
 * - Username
 * - Profile picture
 * - Followers and following count
 * - Follow and message buttons
 * - Crypto tipping feature (if the user has a wallet address)
 *
 * The component supports interactivity, including:
 * - Navigating to a user's profile when clicked.
 * - Opening modals for followers/following lists, messaging, and tipping.
 * - Allowing the current user to change their profile picture.
 */

import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import FollowButton from "@/components/Profile_components/FollowButton";
import MessageButton from "@/components/Notification_components/MessageButton";
import FollowersFollowing from "@/components/Profile_components/FollowersFollowing";
import CryptoTip from "@/components/Crypto_components/CryptoTip"; 
import { useWallet } from "@solana/wallet-adapter-react";
import ProfilePicCropModal from "@/components/Profile_components/ProfilePicCropModal";
import { FaEnvelope } from "react-icons/fa";
import "@/css/components/Profile_components/UserCard.css";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function UserCard({ user, followersCount, followingCount, isInModal, onProfilePictureChange, currentUser }) {
    const [followerCountState, setFollowerCountState] = useState(followersCount || 0);
    const [followingCountState, setFollowingCountState] = useState(followingCount || 0);
    const [showProfilePicModal, setShowProfilePicModal] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [showTipModal, setShowTipModal] = useState(false);
    const wallet = useWallet();
    const [tempImage, setTempImage] = useState(null); // base64 string
    const [showCropModal, setShowCropModal] = useState(false);
    const [viewingType, setViewingType] = useState(""); 
    const navigate = useNavigate();
    const defaultAvatar = "http://localhost:5001/uploads/default-avatar.png";



    // Use user.profilePicture directly instead of local state to prevent desync issues
    const displayedProfilePicture = user?.profilePicture || "http://localhost:5001/uploads/default-avatar.png";

    // Sync followers/following count when user prop updates
    useEffect(() => {
        setFollowerCountState(followersCount || 0);
        setFollowingCountState(followingCount || 0);
    }, [followersCount, followingCount]);


    /**
     * Updates the followers count dynamically when a user follows or unfollows.
     */
    const updateCounts = (change) => {
        setFollowerCountState((prev) => Math.max(prev + change, 0));
    };

    /**
     * Opens the followers/following modal and prevents accidental profile navigation.
     */
    const openModal = (type, event) => {
        event.stopPropagation(); // Prevent navigation when clicking modal elements
        setViewingType(type); // First, update the modal type
        setShowModal(true); // Then open the modal
    };

    /**
     * Handles profile picture changes when the user uploads a new image.
     */
    const handleProfilePictureChange = (event) => {
        event.stopPropagation();
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImage(reader.result);
                setShowCropModal(true);
                event.target.value = ""; // ✅ reset input so same file can trigger again
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleCropComplete = (croppedFile) => {
        onProfilePictureChange(croppedFile);
        setShowCropModal(false);
        setTempImage(null);
        setShowProfilePicModal(false); // ✅ Close the "choose from library" modal too

    };

    const handleProfilePictureError = (e) => {
        const failedSrc = e.target.src;
        const defaultSrc = defaultAvatar;
      
        // ✅ Only trigger toast if it's a custom profile picture (not the default one)
        if (!failedSrc.includes("default-avatar.png")) {
          toast.warn("Could not load profile picture, using default.");
        }
      
        // ✅ Set fallback image
        e.target.src = defaultSrc;
      };
      
    
      const handleRemoveProfilePicture = (e) => {
        e.stopPropagation();
        onProfilePictureChange(null); // Pass null to reset (you handle this in parent)
        toast.info("Profile picture reset to default.");
      };

    const toggleMessageModal = () => {
        setIsMessageModalOpen((prev) => !prev); // Toggle message modal
    };

    const toggleTipModal = () => {
        setShowTipModal((prev) => !prev); // Toggle tip modal
    };

    /**
     * Handles clicking on the UserCard, navigating to the user's profile.
     * Prevents unintended navigation when clicking inside interactive elements (buttons, modals, etc.).
     */
    const handleProfileClick = (event) => {
        if (event.target.closest(".modal-content, .button-group, .edit-profile-btn, .crypto-tip-btn")) {
            event.stopPropagation(); // Prevent navigation when clicking buttons or modals
            return;
        }
        navigate(`/profile/${user.id}`);
    };

    // ✅ Build full profile picture URL
    const fullProfilePicUrl = useMemo(() => {
        return user?.profilePicture
          ? `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${user.profilePicture}`
          : defaultAvatar;
      }, [user?.profilePicture]);
    

    return (
        <div className={isInModal ? "user-card-modal" : "user-card"} onClick={handleProfileClick}>
            <div className="user-left">

                <img
                    src={fullProfilePicUrl}
                    alt={`${user.username}'s profile picture`}
                    className={isInModal ? "user-avatar-modal" : "user-avatar"}
                    onError={handleProfilePictureError}
                    loading="lazy"
                />
                {user.id === currentUser?.id && (
                <>
                    <div
                        className="avatar-edit-icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowProfilePicModal(true);
                        }}
                    >
                        ✏️
                    </div>

                    <input
                        id="profile-pic-input"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleProfilePictureChange}
                    />

                    {showProfilePicModal && (
                        <>
                            <div className="modal-overlay" onClick={() => setShowProfilePicModal(false)}>
                                <div className="modal-content profile-pic-modal" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        className="choose-btn"
                                        onClick={() => {
                                            document.getElementById("profile-pic-input").click();
                                        }}
                                    >
                                        📁 Choose from Library
                                    </button>

                                    {user.profilePicture && user.profilePicture !== defaultAvatar && (
                                        <button
                                            className="remove-btn"
                                            onClick={(e) => {
                                                handleRemoveProfilePicture(e);
                                                setShowProfilePicModal(false);
                                            }}
                                        >
                                            🗑️ Remove Current Picture
                                        </button>
                                    )}

                                    <button className="cancel-btn" onClick={() => setShowProfilePicModal(false)}>
                                        ❌ Cancel
                                    </button>
                                </div>
                            </div>

                            {showCropModal && tempImage && (
                                <ProfilePicCropModal
                                    image={tempImage}
                                    onClose={() => {
                                        setShowCropModal(false);
                                        setTempImage(null);
                                    }}
                                    onCropComplete={handleCropComplete}
                                />
                            )}
                        </>
                    )}
                </>
            )} {/* ✅ This closes user.id === currentUser?.id block */}

            </div>
        <div className="user-right">

            <div className="user-info">
            <h4 className="user-username">{user.username}</h4>

            <p onClick={(e) => openModal("followers", e)} className="follow-link">
            Followers: {followerCountState}
            </p>
            <p onClick={(e) => openModal("following", e)} className="follow-link">
                Following: {followingCountState}
            </p>
            {/* Button Container */}
            <div className="button-group">
                {/* CryptoTip Button - only for other users */}
                {user.walletAddress && user.id !== currentUser?.id && (
                <button
                    className="crypto-tip-btn"
                    onClick={toggleTipModal}
                    aria-label="Tip User"
                >
                    💰 Tip
                </button>
                )}

                {/* Follow & Message Buttons - only show if not own profile */}
                {user.id !== currentUser?.id && (
                <>
                    <FollowButton
                    userId={user.id}
                    updateCounts={updateCounts}
                    isFollowingYou={user.isFollowedByCurrentUser} // if available
                    />
                    <MessageButton recipientUsername={user.username} />
                </>
                )}
            </div>
        </div>
        </div>


                {/* Followers/Following Modal */}
                {showModal && (
                <div className="modal-overlay" onClick={(e) => { e.stopPropagation(); setShowModal(false); }}>
                    <div className="modal-content follow-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setShowModal(false)}>X</button>
                        <h3>{viewingType === "followers" ? "Followers" : "Following"}</h3>
                        <FollowersFollowing 
                            userId={user.id} 
                            type={viewingType} 
                            onClose={() => setShowModal(false)} 
                            currentUserId={currentUser.id}
                            />
                    </div>
                </div>
            )}

                {/* CryptoTip Modal */}
                {showTipModal && (
                <div className="modal-overlay" onClick={(e) => { e.stopPropagation(); toggleTipModal(); }}>
                    <div className="modal-content crypto-tip-modal" onClick={(e) => e.stopPropagation()}>
                    <button className="close-btn" onClick={toggleTipModal}>X</button>
                    <CryptoTip
                        recipientId={user.id}
                        recipientWallet={user.walletAddress}
                        currentUser={currentUser}
                        onTipSuccess={(message) => {
                        alert(message);
                        toggleTipModal();
                        }}
                        toggleTipModal={toggleTipModal} // ✅ Passed in here
                    />
                    </div>
                </div>
                )}

                {/* Message Modal */}
                {isMessageModalOpen && (
                <div className="modal-overlay" onClick={(e) => { e.stopPropagation(); toggleMessageModal(); }}>
                    <div className="modal-content message-modal" onClick={(e) => e.stopPropagation()}>
                    <button className="close-btn" onClick={toggleMessageModal}>X</button>
                    <h3 className="message-header">Send a Message to <span>{user.username}</span></h3>
                        <form className="message-form" onSubmit={(e) => e.preventDefault()}>
                            <textarea placeholder="Write your message..." className="message-input" rows="4"></textarea>
                            <button type="submit" className="send-message-btn">Send</button>
                        </form>
                    </div>
                </div>
                )}
                <ToastContainer position="top-right" autoClose={4000} theme="dark" />

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
        walletAddress: PropTypes.string, 
    }).isRequired,
    currentUser: PropTypes.object.isRequired,
    onProfilePictureChange: PropTypes.func.isRequired,
    isInModal: PropTypes.bool
};

export default React.memo(UserCard);


/**
 * Potential Improvements:
 * - Improve error handling when fetching profile pictures.
 * - Implement lazy loading for profile images to improve performance.
 * - Add animation effects for smoother modal transitions.
 * - Allow users to remove profile pictures and reset to default.
 */