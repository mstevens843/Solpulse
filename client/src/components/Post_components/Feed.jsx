import React, { useState, useEffect, useRef, useContext } from "react";
import PropTypes from "prop-types";
import Post from "@/components/Post_components/Post";
import FeedFilter from "@/components/Post_components/FeedFilter";
import PostComposer from "@/components/Post_components/PostComposer";
import { api } from "@/api/apiConfig";
import { AuthContext } from "@/context/AuthContext";
import "@/css/components/Post_components/Feed.css";


function Feed({ currentUser }) {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filter, setFilter] = useState("all"); // Added filter state
    const observerRef = useRef(null);


    // Fetch posts from API with filter and pagination
    const fetchPosts = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log("Fetching posts for page:", page);
            const response = await api.get(`/posts?page=${page}&limit=5&filter=${filter}`);
            
            if (response.data && response.data.posts) {
                setPosts((prevPosts) => [...prevPosts, ...response.data.posts]);
                setHasMore(response.data.posts.length > 0);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.error("Error fetching posts:", err.response?.data || err.message);
            setError("Failed to load posts. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Trigger fetching posts when page changes
    useEffect(() => {
        fetchPosts();
    }, [page, filter]);

    // Infinite Scroll using Intersection Observer
    useEffect(() => {
        if (!hasMore) return;

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !loading) {
                setPage((prevPage) => prevPage + 1);
            }
        });

        if (observerRef.current) {
            observerRef.current.observe(document.getElementById("feed-end"));
        }

        return () => observerRef.current?.disconnect();
    }, [loading, hasMore]);


    return (
        <div className="community-feed-container">

            <h3 className="community-feed-title">Community Feed</h3>

            <FeedFilter onFilterChange={(selectedFilter) => {
                setFilter(selectedFilter);
                setPosts([]);  // Reset posts when filter changes
                setPage(1);
                setHasMore(true);
            }} />

            {error && (
                <div className="community-feed-error" role="alert" aria-live="assertive">
                    <p>{error}</p>
                </div>
            )}
            
            <PostComposer onPostCreated={(newPost) => {
                setPosts((prevPosts) => [newPost, ...prevPosts]);
                window.scrollTo({ top: 0, behavior: "smooth" }); // Smooth scroll to top
            }} />


            <ul className="community-feed-list">
                {posts.map((post, index) => (
                    <li key={`${post.id}-${index}`} className="community-feed-post">
                        <div className="post-container">
                            <Post post={post} currentUser={currentUser} setPosts={setPosts} />
                        </div>
                    </li>
                ))}
            </ul>


            {loading && (
                <p className="community-feed-loading" role="status" aria-live="polite">
                    Loading posts...
                </p>
            )}

            <div id="feed-end"></div>

            {!hasMore && (
                <p className="community-feed-empty">No more posts to show.</p>
            )}
        </div>
    );
}

Feed.propTypes = {
    currentUser: PropTypes.object, // Made optional to avoid prop errors
};

export default Feed;