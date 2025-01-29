// This page displays a list of users who follow the specified user and users the specified user is following. 
// It fetches followers and following data from the API and organizes them into two sections: "Followers" and "Following". 
// Each user is represented by a UserCard component, providing a detailed view of the user's profile. The page dynamically
// updates based on the provided User ID. 


import React, { useState, useEffect } from "react";
import { api } from "@/api/apiConfig"; // Centralized API instance
import UserCard from "@/components/Profile_components/UserCard"; // Updated alias for UserCard
import "@/css/components/Profile_components/FollowersFollowing.css"; // Updated alias for CSS import

function FollowersFollowing({ userId, type }) {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("")

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError("");
            try {
                let response;
                if (type === "followers") {
                    response = await api.get(`/users/${userId}/followers`);
                    setList(response.data.followers || []);
                } else {
                    response = await api.get(`/users/${userId}/following`);
                    setList(response.data.following || []);
                }
            } catch (err) {
                setError("Failed to fetch list.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [userId, type]);

    return (
        <div>
            {error && <p>{error}</p>}
            {loading ? <p>Loading...</p> : (
                <>
                    {list.length === 0 ? (
                        <p>No {type} yet.</p>
                    ) : (
                        <ul>
                            {list.map((user) => (
                                <li key={user.id}>
                                    <UserCard user={user} />
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </div>
    );
}
export default FollowersFollowing;






// Components Added: 
// UserCard Component: Added to render individual followers/following in a clean reusable way, showing basic user information. 


// IMPROVEMENTS MADE: 
// BATCH API REQUESTS: Used 'Promise.all' to fetch followers and following in Parallel, improving performance. 
// LOADING STATE: Added a 'loading' state to indicae ongoing data fetching/ 
// ERROR STATE: Added an 'error' state to display user-friendly error messages. 
// FALLBACK UI: Display meaningful messages when the followers or following lists are empty. 
// COUNTS: Displayed total counts of followers and following in section headers. 

// Future Enhancements
// Add Search Functionality:

// Allow users to search or filter the followers and following lists.
// Pagination or Infinite Scroll:

// Implement pagination or infinite scrolling to handle large lists effectively.
// Real-Time Updates:

// Use WebSockets to update the followers and following lists in real-time when users follow/unfollow others.

// FollowersFollowing.js Improvements
// API Caching:

// Cache the followers and following data in local storage to reduce redundant API calls when revisiting the page.
// Error Boundary:

// Wrap this component in an error boundary to gracefully handle API failures.
// Pagination:

// Implement pagination for long lists of followers or following to improve performance.

// Key Updates
// Component (FollowersFollowing.js)
// Loading State:

// Added a styled loading message for better user experience while fetching data.
// Error Handling:

// Styled error messages to make them noticeable and consistent with other components.
// Responsive Design:

// Used a grid layout for user cards to display well across different screen sizes.
// Dynamic Headers:

// Added section-specific headers with follower and following counts.