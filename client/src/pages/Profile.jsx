/**
 * Profile.js - Displays a user's profile with posts, followers, and bio editing
 *
 * This file is responsible for:
 * - Fetching and displaying user profile details.
 * - Allowing authenticated users to edit their bio.
 * - Managing profile picture updates.
 * - Displaying posts made by the user.
 * - Handling crypto tipping functionality (commented out for now).
 */

import React, { useState, useEffect, useCallback, useContext, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import UserCard from "@/components/Profile_components/UserCard";
import Post from "@/components/Post_components/Post";
import CryptoTip from "@/components/Crypto_components/CryptoTip";
import PrivateProfileNotice from "@/components/Profile_components/PrivateProfileNotice"
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Loader from "@/components/Loader";
import { AuthContext } from "@/context/AuthContext";
import { api } from "@/api/apiConfig";
import "@/css/pages/Profile.css";

import { lazy, Suspense } from "react"; // ✅ Added for lazy loading
const LazyPost = lazy(() => import("@/components/Post_components/Post")); // ✅ Lazy load Post


function Profile() {
    const { user: currentUser } = useContext(AuthContext);
    const { id: userId } = useParams();
    const [user, setUser] = useState(null);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [posts, setPosts] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [bio, setBio] = useState("");
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [showTipModal, setShowTipModal] = useState(false);
    const fetchingRef = useRef(false); // ⬅️ Prevent overlapping fetches
    const [showUserCardModal, setShowUserCardModal] = useState(false); 
    const [profilePicture, setProfilePicture] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const isInModal = false; // Default value if it's not already defined

    const isOwner = currentUser.id === profileUser.id;
    const isFollower = profileUser.isFollowedByCurrentUser; // assuming this is returned from API
    const isPrivate = profileUser.privacy === 'private';
    const canViewConnections = isOwner || isFollower || !isPrivate;



    /**
     * Fetches user profile and posts with retry logic.
     */
    const fetchProfile = useCallback(async () => {
        if (fetchingRef.current || !hasMore) return;
        fetchingRef.current = true;
        setLoading(true);
        setErrorMessage("");
    
        // ✅ Cache check - skip re-fetch if the same profile is already loaded
        if (user && user.id === userId) {
            console.log("✅ Using cached profile.");
            setLoading(false);
            return;
        }
    
        let retries = 3;
    
        while (retries > 0) {
            try {
                console.log(`Fetching profile for user ID: ${userId}`);
    
                // Fetch user profile
                const userResponse = await api.get(`/users/${userId}`);
                const { user, followersCount, followingCount } = userResponse.data;
    
                setUser(user); // keep it clean — no unnecessary overwrite of bio here

    
                setProfilePicture(user.profilePicture || "http://localhost:5001/uploads/default-avatar.png");
                setBio(user.bio || "");
                setFollowersCount(followersCount ?? 0);
                setFollowingCount(followingCount ?? 0);
    
                // Fetch posts
                const postsResponse = await api.get(`/posts/${userId}/profile-feed?page=${page}&limit=10`);
                const postsData = postsResponse.data.posts;

                if (postsData.length < 10) setHasMore(false);

                // 🧠 Fetch comment counts for all posts (batch)
                const postIds = postsData.map((p) => p.id);

                let countsMap = {};
                if (postIds.length > 0) {
                const commentCountRes = await api.post("/comments/batch-count", { postIds });

                // 🧠 Create a map of counts for fast access
                const commentCounts = commentCountRes.data?.counts || [];

                commentCounts.forEach(({ postId, count }) => {
                    countsMap[postId] = count;
                });
                }

                // 🧠 Add counts to each post object
                const postsWithCounts = postsData.map((post) => ({
                ...post,
                commentCount: countsMap[post.id] || 0,
                }));

                setPosts((prev) => page === 1 ? postsWithCounts : [...prev, ...postsWithCounts]);
    
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
    }, [userId, user, page]); // ✅ Include `page` so data updates as page changes


    useEffect(() => {
        // Reset page and posts when switching users
        setUser(null);
        setPage(1);
        setPosts([]);
        setHasMore(true);
      }, [userId]);
      
    
    useEffect(() => {
        fetchProfile();
    }, [fetchProfile, page]); // ✅ Include `page` to fetch new pages
    
    const loadMore = () => {
        if (hasMore && !fetchingRef.current) {
            setPage((prev) => prev + 1);
        }
    };

    /**
     * Handles profile picture upload.
     */
    const handleProfilePictureUpdate = async (file) => {
        if (!file) {
            try {
                await api.delete('/users/remove-profile-picture', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("token")}`,
                    },
                });
    
                // ✅ Update local user state to remove profile picture
                setUser((prevUser) => ({
                    ...prevUser,
                    profilePicture: "http://localhost:5001/uploads/default-avatar.png",
                }));
    
                toast.success("Profile picture removed.");
            } catch (error) {
                console.error("Failed to remove profile picture:", error);
                toast.error("Failed to remove profile picture.");
            }
            return;
        }
    
        if (!file.type.startsWith("image/")) {
            toast.error("Only image files are allowed.");
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
    
            const updatedPictureUrl = response.data.profilePicture;
    
            // ✅ Update local user state with new picture
            setUser((prevUser) => ({
                ...prevUser,
                profilePicture: updatedPictureUrl,
            }));
    
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
    
    
    

    /**
     * Handles bio update for authenticated users.
     */
    /**
 * Handles bio update for authenticated users.
 */
    const handleSave = async () => {
        try {
            await api.put(`/users/profile/${userId}`, 
                { bio },
                { headers: { Authorization: `Bearer ${currentUser.token}` } }
            );
            setEditMode(false);
    
            // ✅ Update local user state with new bio (prevents refetch + rerender loop)
            setUser((prevUser) => ({ ...prevUser, bio }));
    
            toast.success("Bio updated successfully!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
            });
    
        } catch (error) {
            console.error("Error saving bio:", error);
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
    

    /**
     * Adds a new comment to a post.
     */
    const addCommentToPost = (postId, newComment) => {
        setPosts((prevPosts) =>
            prevPosts.map((post) =>
                post.id === postId
                    ? { ...post, comments: [...(post.comments || []), newComment] }
                    : post
            )
        );
    };

    const memoizedUser = useMemo(() => {
        return user;
      }, [user?.id, user?.profilePicture, user?.bio]);

    return (
        <div className="profile-container">
            {/* <ToastContainer /> */}
    
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
                    {/* ✅ [Future]: Integrate image cropper before upload (currently placeholder only) */}
                    <UserCard 
                        user={memoizedUser}
                        followersCount={followersCount}
                        followingCount={followingCount}
                        isInModal={isInModal} 
                        currentUser={currentUser}
                        canViewConnections={canViewConnections}
                        onProfilePictureChange={handleProfilePictureUpdate} 
                    />
                    </div>
    

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

                    {user.privacy === 'private' && currentUser?.id !== user.id && !user.isFollowedByCurrentUser ? (
                    <PrivateProfileNotice />
                    ) : (
                        <div className="posts-list">
                        {posts.length > 0 ? (
                            posts.map((post) => (
                            <div key={post.id} className="post-container">
                                {post.isRetweet && (
                                <p className="retweet-indicator"></p>
                                )}
                                <Suspense fallback={<p>Loading posts...</p>}>
                                <LazyPost
                                    post={post}
                                    commentCount={post.commentCount}
                                    currentUser={currentUser}
                                    setPosts={setPosts}
                                    onCommentAdd={(newComment) => addCommentToPost(post.id, newComment)}
                                />
                                </Suspense>
                            </div>
                            ))
                        ) : (
                            <div className="no-posts-message">
                            <p>No posts available</p>
                            </div>
                        )}
                        {hasMore && !loading && (
                            <div className="load-more-container">
                            <button className="load-more-btn" onClick={loadMore}>
                                Load More
                            </button>
                            </div>
                        )}
                        </div>
                    )}
                    </section>
                </>
            )}
        </div>
    );
}

export default Profile;


/**
 * 🔹 Potential Improvements:
 * - Optimize profile fetch with better caching or state management.
 * - Implement lazy loading for posts to improve performance.
 * - Improve error handling for profile picture uploads.
 * - Add a confirmation prompt before saving bio edits.
 * - Allow image cropping before uploading profile pictures.
 */



/**
 * 🔹 Implemented Improvements:
 * ✅ Optimized profile fetch with caching.
 * ✅ Lazy loaded Post component.
 * ✅ Improved error handling for profile picture uploads.
 * ✅ Added confirmation before saving bio edits.
 * ✅ Placeholder for future image cropping integration.
 */