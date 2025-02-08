import { React, useEffect, useState } from "react";
import PropTypes from "prop-types";
import FollowButton from "@/components/Profile_components/FollowButton";
import MessageButton from "@/components/Notification_components/MessageButton";
import FollowersFollowing from "@/components/Profile_components/FollowersFollowing";
import { useNavigate } from "react-router-dom";
import CryptoTip from "@/components/Crypto_components/CryptoTip"; 
import { useWallet } from "@solana/wallet-adapter-react";
import { FaEnvelope } from "react-icons/fa";
import "@/css/components/Profile_components/UserCard.css";

function UserCard({ user, isInModal, onProfilePictureChange, currentUser }) {
    const [followersCount, setFollowersCount] = useState(user.followersCount || 0);
    const [followingCount, setFollowingCount] = useState(user.followingCount || 0);
    const [showModal, setShowModal] = useState(false);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [showTipModal, setShowTipModal] = useState(false);
    const wallet = useWallet(); // ✅ Define wallet
    const [viewingType, setViewingType] = useState(""); 
    const navigate = useNavigate();


    // Use user.profilePicture directly instead of local state to prevent desync issues
    const displayedProfilePicture = user?.profilePicture || "http://localhost:5001/uploads/default-avatar.png";

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
            <div className="user-left">

                <img
                    src={`${user?.profilePicture ? `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${user.profilePicture}` : "http://localhost:5001/uploads/default-avatar.png"}?timestamp=${new Date().getTime()}`}
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
            </div>


        <div className="user-right">

            <div className="user-info">
            <h4 className="user-username">{user.username}</h4>

            <p onClick={() => openModal("followers")} className="follow-link">
                Followers: {followersCount}
            </p>
            <p onClick={() => openModal("following")} className="follow-link">
                Following: {followingCount}
            </p>

            {/* Button Container */}
            <div className="button-group">
                {/* CryptoTip Button */}
                {user.walletAddress && (
                    <button
                        className="crypto-tip-btn"
                        onClick={toggleTipModal}
                        aria-label="Tip User"
                    >
                        💰 Tip
                    </button>
                )}

                {/* Follow & Message Buttons */}
                <FollowButton userId={user.id} updateCounts={updateCounts} />
                <MessageButton recipientUsername={user.username} />
            </div>
        </div>
        </div>


                {/* Followers/Following Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal-content follow-modal" onClick={(e) => e.stopPropagation()}>
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
                                connectedWallet={wallet.publicKey?.toString()} // ✅ Pass connected wallet
                                isWalletConnected={wallet.connected} // ✅ Pass connection status
                                onTipSuccess={(message) => {
                                    alert(message);
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
                            <h3 className="message-header">Send a Message to <span>{user.username}</span></h3>
                            <form className="message-form" onSubmit={(e) => e.preventDefault()}>
                                <textarea placeholder="Write your message..." className="message-input" rows="4"></textarea>
                                {/* <input type="text" className="crypto-tip-input" placeholder="Crypto Tip (optional)" /> */}
                                <button type="submit" className="send-message-btn">Send</button>
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
        walletAddress: PropTypes.string, 
    }).isRequired,
    currentUser: PropTypes.object.isRequired,
    onProfilePictureChange: PropTypes.func.isRequired,
    isInModal: PropTypes.bool
};

export default UserCard;