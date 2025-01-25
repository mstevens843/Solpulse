// Feed component is designed to display a list of posts, providing a snapshot of community activity 
// Includes:
// POST DISPLAY: renders list of posts, each showing the username of the poster and the post content.
// DYNAMIC UPDATES: simulates fetching posts from an API and updates the feed when new data is retreived. 
// COMMUNITY FOCUS: highlights user-generated content to foster engagement and interaction. 

// This component serves as core feature for platforms centered around communit discussions and updates. 


import React, { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import Post from "@/components/Post";
import FeedFilter from "@/components/FeedFilter";
import { api } from "@/api/apiConfig";
import "@/css/components/Feed.css";
import { AuthContext } from "@/context/AuthContext";

function Feed({ currentUser }) {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [retrying, setRetrying] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filter, setFilter] = useState("posts");

    // Fetch posts from the API with filter
    const fetchPosts = async () => {
        setLoading(true);
        setError(null);
        setRetrying(false);

        try {
            const response = await api.get(`/posts?page=${page}&filter=${filter}`);
            if (response.data && response.data.posts) {
                const sanitizedPosts = response.data.posts.map((post) => ({
                    ...post,
                    user: post.user || { username: 'Unknown' },
                    comments: post.comments || [],
                }));

                setPosts((prev) =>
                    [...prev, ...sanitizedPosts]
                        .filter((post, index, self) => self.findIndex((p) => p.id === post.id) === index)
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                );

                setHasMore(response.data.posts.length > 0);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.error("Error fetching posts:", err);
            setError("Failed to load posts. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch posts when component mounts or when the page/filter changes
    useEffect(() => {
        fetchPosts();
    }, [page, filter]);

    const handleRetry = async () => {
        setRetrying(true);
        await fetchPosts();
    };

    const loadMore = () => {
        if (hasMore && !loading) setPage((prev) => prev + 1);
    };

    return (
        <div className="community-feed-container">
            <h3 className="community-feed-title">Community Feed</h3>

            <FeedFilter onFilterChange={(selectedFilter) => {
                setFilter(selectedFilter);
                setPage(1);
                setPosts([]);
            }} />

            {loading && posts.length === 0 && (
                <p className="community-feed-loading" role="status" aria-live="polite">
                    Loading posts...
                </p>
            )}

            {error && posts.length === 0 && (
                <div className="community-feed-error" role="alert" aria-live="assertive">
                    <p>{error}</p>
                    <button onClick={handleRetry} disabled={retrying}>
                        {retrying ? "Retrying..." : "Retry"}
                    </button>
                </div>
            )}

            <ul className="community-feed-list">
                {posts.map((post) => (
                    <li key={post.id} className="community-feed-post">
                        <Post
                            post={post}
                            currentUser={currentUser}
                            onNewComment={(newComment) => {
                                setPosts((prevPosts) =>
                                    prevPosts.map((p) =>
                                        p.id === post.id
                                            ? { ...p, comments: [...(p.comments || []), newComment] }
                                            : p
                                    )
                                );
                            }}
                        />
                    </li>
                ))}
            </ul>

            {!loading && posts.length === 0 && !error && (
                <p className="community-feed-empty">No posts available.</p>
            )}

            {hasMore && !loading && (
                <button className="load-more" onClick={loadMore}>
                    Load More
                </button>
            )}
        </div>
    );
}

Feed.propTypes = {
    currentUser: PropTypes.object.isRequired,
};

export default Feed;


















// Pages where the FEED component is implemented: 

// HOMEPAGE: home page prominently display's the user's personalized feed, making the FEED component a key feature. 
// Reference: Positioned in the "YOUR FEED" section of the page. 

// DASHBOARD page: 
// why: The 'DASHBOARD' aggregates user-specific data and activities, including the feed, to provide a centralized view of updates. 
// reference: appears in the 'Your Feed' section of the dashboard, ensuring users can keep up with recent posts. 

// 2. Feed
// Reason:

// Frequent API fetches.
// Uncontrolled re-rendering when the feed updates.
// Updates Needed:

// Use React.memo to wrap individual list items in the feed.
// useMemo for rendering post lists to avoid recomputation on every state change.
// Debounce fetchPosts call to reduce redundant API requests.

// Key Changes
// Functional Changes (Feed Component)
// Loading State:

// Added a loading message while posts are being fetched.
// Error Handling:

// Displayed a clear error message when the API call fails.
// Improved UX for Empty Feed:

// Shows a specific message ("No posts available") when the feed is empty and not loading.



// Issues & Improvements:
// Debounce in useEffect:

// While debounce is great for optimizing repetitive user actions (e.g., typing in a search box), using it in useEffect for fetching posts can introduce 
// unnecessary complexity.
// In this case, it's not necessary since the data fetch happens only once when the component mounts.
// Error Handling:

// It's good to display an error message, but adding a retry button can enhance the user experience.
// A detailed log of the error object (err.response if available) can help in debugging.
// Empty Feed Message:

// Make sure to distinguish between an empty feed (legitimate case) and a failure to fetch posts (error case).
// Data Display:

// post.userId might not be user-friendly. Consider displaying the username instead if available.
// Cleanup Logic:

// The fetchPosts.cancel() is unnecessary since the fetchPosts function itself is not used as an event listener. You can safely remove the debounce.
