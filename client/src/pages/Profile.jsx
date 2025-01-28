import React, { useState, useEffect, useCallback, useContext } from "react";
import { useParams } from "react-router-dom";
import UserCard from "@/components/UserCard";
import Post from "@/components/Post";
import CryptoTip from "@/components/CryptoTip";
import { ToastContainer, toast } from "react-toastify";
// import UserCardModal from "@/components/UserCardModal"; // Import the modal component
import 'react-toastify/dist/ReactToastify.css';
import Loader from "@/components/Loader";
import { AuthContext } from "@/context/AuthContext";
import { api } from "@/api/apiConfig";
import "@/css/pages/Profile.css";


function Profile() {
    const { user: currentUser } = useContext(AuthContext);
    const { id: userId } = useParams();
    const [user, setUser] = useState(null);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [posts, setPosts] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [bio, setBio] = useState("");
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [showTipModal, setShowTipModal] = useState(false);
    const [showUserCardModal, setShowUserCardModal] = useState(false); // Add state to toggle modal
    const [profilePicture, setProfilePicture] = useState(""); // New state for profile picture
    const [successMessage, setSuccessMessage] = useState("");


    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setErrorMessage("");
        let retries = 3;
    
        while (retries > 0) {
            try {
                console.log(`Fetching profile for user ID: ${userId}`);
                
                // Fetch user profile, including followers/following counts and profile picture
                const userResponse = await api.get(`/users/${userId}`);
                const { user, followersCount, followingCount } = userResponse.data;
                
                setUser({
                    ...user,
                    followersCount: followersCount ?? 0,  // Ensure default value if undefined
                    followingCount: followingCount ?? 0,  // Ensure default value if undefined
                });
                console.log("Setting profile picture:", user.profilePicture);
                setProfilePicture(user.profilePicture || "/default-avatar.png");  // Ensure the latest profile picture
                
                setBio(user.bio || "");  // Default empty string if null
                setFollowersCount(followersCount ?? 0);
                setFollowingCount(followingCount ?? 0);
                
                // Fetch posts specific to the user
                const postsResponse = await api.get(`/posts/${userId}/profile-feed`);
            setPosts(postsResponse.data.posts);
    
                setLoading(false);
                return;
            } catch (error) {
                console.error("Error fetching profile:", error);
                retries -= 1;
                if (retries === 0) {
                    setErrorMessage("Failed to load profile. Please try again later.");
                    setLoading(false);
                } else {
                    await new Promise((resolve) =>
                        setTimeout(resolve, 2000 * Math.pow(2, 3 - retries))
                    );
                }
            }
        }
    }, [userId]);
    
    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);


    const handleProfilePictureUpdate = async (file) => {
        if (!file) {
            toast.error('Please select a valid file.');
            return;
        }
    
        const formData = new FormData();
        formData.append('profilePicture', file);
    
        try {
            console.log("Uploading file:", file.name);
    
            const response = await api.post('/users/upload-profile-picture', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`,  
                    'x-auth-token': localStorage.getItem("token"), 
                },
            });
    
            console.log("Upload successful. Response:", response.data);
    
            // Trigger profile refetch to persist changes
            await fetchProfile();
    
            toast.success('Profile picture updated successfully.');
        } catch (error) {
            console.error("Error uploading profile picture:", error.response?.data || error.message);
    
            if (error.response?.status === 400) {
                toast.error('Invalid file upload. Please select an image.');
            } else if (error.response?.status === 401) {
                toast.error('Unauthorized. Please log in again.');
            } else {
                toast.error('Failed to upload profile picture.');
            }
        }
    };

    
    const handleSave = async () => {
        try {
            await api.put(`/users/profile/${userId}`, 
                { bio },
                { headers: { Authorization: `Bearer ${currentUser.token}` } }
            );
            setEditMode(false);
            setUser((prevUser) => ({ ...prevUser, bio }));

            // Show success toast notification
            toast.success("Bio updated successfully!", {
                position: "top-right",
                autoClose: 3000,  // Auto-close after 3 seconds
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
            });

        } catch (error) {
            console.error("Error saving bio:", error);

            // Show error toast notification
            toast.error("Failed to save bio. Please try again.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
            });
        }
    };



    const addCommentToPost = (postId, newComment) => {
        setPosts((prevPosts) =>
            prevPosts.map((post) =>
                post.id === postId
                    ? { ...post, comments: [...(post.comments || []), newComment] }
                    : post
            )
        );
    };

    

    return (
        <div className="profile-container">
            <ToastContainer />
    
            {loading ? (
                <div className="profile-loader">
                    <Loader />
                </div>
            ) : errorMessage ? (
                <div className="error-container">
                    <p>{errorMessage}</p>
                    <button onClick={fetchProfile}>Retry</button>
                </div>
            ) : (
                <>
                    <div className="user-card-container">
                    <UserCard 
                        user={{ ...user, profilePicture }}  // Ensure updated picture is passed
                        currentUser={currentUser}  
                        onProfilePictureChange={handleProfilePictureUpdate} 
                    />
                        {/* {user.walletAddress && (
                            <button
                                className="crypto-tip-btn"
                                onClick={() => setShowTipModal(true)}
                                aria-label="Tip User"
                            >
                                💰
                            </button> */}
                        )}
                    </div>
    
                    {/* {showTipModal && (
                        <div className="tip-modal-overlay" onClick={() => setShowTipModal(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <h3>Send Crypto Tip</h3>
                                <CryptoTip 
                                    recipientId={user.id} 
                                    recipientWallet={user.walletAddress} 
                                    onTip={handleTip} 
                                />
                                <button className="close-btn" onClick={() => setShowTipModal(false)}>Close</button>
                            </div>
                        </div>
                    )}
     */}
                    {showUserCardModal && (
                        <UserCardModal user={user} onClose={() => setShowUserCardModal(false)} />
                    )}
    
                    {editMode && (
                        <div className="edit-bio-overlay" onClick={() => setEditMode(false)}>
                            <div className="edit-bio-content" onClick={(e) => e.stopPropagation()}>
                                <h3>Edit Bio</h3>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    maxLength={160}
                                    placeholder="Write something about yourself (max 160 characters)"
                                />
                                <div className="edit-actions">
                                    <button onClick={handleSave}>Save</button>
                                    <button onClick={() => setEditMode(false)}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}
    
                    <div className="bio-display">
                        <p>{user.bio || "No bio available."}</p>
                        {currentUser?.id === user.id && (
                            <button onClick={() => setEditMode(true)}>Edit Bio</button>
                        )}
                    </div>
    
                    <section className="posts-container">
                        <h3>Posts</h3>
                        <div className="posts-list">
                            {posts.length > 0 ? (
                                posts.map((post) => (
                                    <div key={post.id} className="post-container">
                                        {post.isRetweet && (
                                            <p className="retweet-indicator">
                                            </p>
                                        )}
                                        <Post
                                            post={post}
                                            currentUser={currentUser}
                                            onCommentAdd={(newComment) => addCommentToPost(post.id, newComment)}
                                        />
                                    </div>
                                ))
                            ) : (
                                <p>No posts available</p>
                            )}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}

export default Profile;