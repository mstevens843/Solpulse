export const apiUrl = import.meta.env.VITE_API_BASE_URL;

import axios from "axios";

export const api = axios.create({
    baseURL: apiUrl,
    withCredentials: true, // Include credentials for cookies/session handling
});

// Attach tokens to every request
const excludedRoutes = [
    "/auth/login",
    "/auth/register",
    "/trendingCrypto",
    "/trade",
];

api.interceptors.request.use(
    (config) => {
        // Check if the request URL matches any excluded routes
        const shouldSkip = excludedRoutes.some(route => config.url.includes(route));
        if (shouldSkip) {
            console.log(`Skipping token attachment for: ${config.url}`);
            return config;
        }

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


// Utility function for dynamic headers
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

