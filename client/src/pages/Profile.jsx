import React, { useState, useEffect, useCallback, useContext } from "react";
import { useParams } from "react-router-dom";
import UserCard from "@/components/UserCard";
import Post from "@/components/Post";
import CryptoTip from "@/components/CryptoTip";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Loader from "@/components/Loader";
import { AuthContext } from "@/context/AuthContext";
import { api } from "@/api/apiConfig";
import "@/css/pages/Profile.css";


function Profile() {
    const { user: currentUser } = useContext(AuthContext);
    const { id: userId } = useParams();
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [bio, setBio] = useState("");
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [showTipModal, setShowTipModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");


    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setErrorMessage("");
        let retries = 3;
    
        while (retries > 0) {
            try {
                console.log(`Fetching profile for user ID: ${userId}`);
                
                // Fetch user profile
                const userResponse = await api.get(`/users/${userId}`);
                const { user } = userResponse.data;
                setUser(user);
                setBio(user.bio || "");
    
                // Fetch posts specific to the user
                const postsResponse = await api.get(`/posts?userId=${userId}`);
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

    const handleTip = async ({ toUserId, recipientWallet, amount, message }) => {
        try {
            const response = await api.post("/tips", {
                toUserId,
                amount,
                message,
            });
    
            toast.success(`Tip of ${amount} SOL sent successfully to ${recipientWallet}!`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
            });
    
            setShowTipModal(false);
        } catch (error) {
            console.error("Error sending tip:", error);
            toast.error("Failed to send tip. Please try again later.", {
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
                        <UserCard user={user} />
                        {user.walletAddress && (
                            <button
                                className="crypto-tip-btn"
                                onClick={() => setShowTipModal(true)}
                                aria-label="Tip User"
                            >
                                💰
                            </button>
                        )}
                    </div>

                    {showTipModal && (
                        <div className="modal-overlay" onClick={() => setShowTipModal(false)}>
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
                                    <Post
                                        key={post.id}
                                        post={post}
                                        onCommentAdd={(newComment) =>
                                            addCommentToPost(post.id, newComment)
                                        }
                                    />
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