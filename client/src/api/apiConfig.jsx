/**
 * api.js - Handles API communication with the backend. 
 * 
 * This file is responsible for:
 * - Setting up the Axios instance for API calls.
 * - Attaching authentication tokens for requests. 
 * - Configuring API base URL dynamically using environment variables. 
 * - Providing helper functions for consistent headers. 
 */

// Base API url from environment variables. 
export const apiUrl = import.meta.env.VITE_API_BASE_URL;

// dependencies.
import axios from "axios";

export const api = axios.create({
    baseURL: apiUrl,
    withCredentials: true, // Include credentials for cookies/session handling
});

/** 
 * List of routes that do NOT require authentication tokens.
 * Requests to these routes will skip token attachment.
 */
const excludedRoutes = [
    "/auth/login",
    "/auth/register",
    "/trendingCrypto",
    "/api/trendingCrypto",
    "/api/trendingCrypto/chart",
    "/api/trendingCrypto/global",
    "/api/trendingCrypto/nfts",
    "/api/trendingCrypto/top-gainers-losers",
    "/api/trendingCrypto/search",
    "/trade",
];



/** 
 * Axios request interceptor:
 * - Attaches JWT token from localStorage to all requests (except excluded routes).
 * - Uses both "Authorization" and "x-auth-token" headers.
 */
api.interceptors.request.use(
    (config) => {
        // Check if the request URL matches any excluded routes
        const shouldSkip = excludedRoutes.some(route =>
            config.url.toLowerCase().startsWith(route.toLowerCase())
          );        
          if (shouldSkip) {
            console.log(`Skipping token attachment for: ${config.url}`);
            return config;
        }
        
        // Retrieve token from localStorage
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            config.headers["x-auth-token"] = token;  // Optional header
        } else {
            console.warn("No token found in localStorage");
        }

        return config;
    },
    (error) => {
        console.error("Request error:", error);
        return Promise.reject(error);
    }
);


/**
 * Utility function to generate request headers dynamically.
 * 
 * @param {string} contentType - MIME type of the request (default: application/json)
 * @param {boolean} useBearer - Whether to include "Authorization: Bearer" or "x-auth-token"
 * @returns {Object} - Headers object for API requests
 */

export const getHeaders = (contentType = "application/json", useBearer = true) => {
    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": contentType,
    };
    if (token) {
        if (useBearer) {
            headers["Authorization"] = `Bearer ${token}`;
        } else {
            headers["x-auth-token"] = token;
        }
    }
    return headers;
};
