/**
 * fetchUserData.js (rename file) - Fetches authenticated user's details. 
 * 
 * This file is responsible for:
 * - Making an authenticated API request to fetch the logged-in user's data.
 * - Implementing a retry mechanism for handling transient failures.
 * - Providing error handling for different failure scenarios. 
 */


import { api } from "./apiConfig";


/**
 * Fetches the authenticated user's data. 
 * 
 * - Retreives the JWT token from localStoage. 
 * - Sends a GET request to `/users/me` using Axios. 
 * - Implements a retry mechanism (up to 3 attempts) for network failures. 
 * - Returns the user object on success.
 */


export const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Token is missing. User is not authenticated.");
    }

    /**
     * Attempts to fetch user data with retries.
     * 
     * - Retries up to `retries` times in case of transient failures.
     * - If all attempts fail, it throws the final error.
     * 
     * @param {number} retries - Number of retry attempts (default: 3)
     * @returns {Promise<Object>} Axios response object
     * @throws {Error} If all retry attempts fail
     */
    const retryFetch = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await api.get("/users/me");
                return response;
            } catch (error) {
                if (i === retries - 1) throw error; // Throw error after final attempt
            }
        }
    };

    try {
        const response = await retryFetch();

        if (response.status !== 200) {
            console.error("Unexpected response status:", response.status);
            throw new Error("Failed to fetch user data. Unexpected response.");
        }

        if (!response?.data?.user) {
            console.warn("User data is missing in the response:", response?.data);
            throw new Error("User data not found in response.");
        }

        return response.data.user; // Return the user object.
    } catch (error) {
        if (error.response) {
            console.error("Server error fetching user data:", error.response.data || error.message);
        } else if (error.request) {
            console.error("No response received from server while fetching user data:", error.request);
        } else {
            console.error("Unexpected error fetching user data:", error.message);
        }

        throw error; // Re-throw the error to allow calling functions to handle it.
    }
};

/**
 * Potential Improvements:
 * - **Token Expiry Handling:** If the token is expired, trigger a logout or refresh flow.
 * - **Enhanced Retry Logic:** Introduce exponential backoff for retrying requests.
 * - **Caching User Data:** Store user data in a global state (e.g., Redux, Context API) to avoid redundant API calls.
 * - **Custom Error Handling:** Return specific error messages based on the error response code.
 */