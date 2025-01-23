export const apiUrl = import.meta.env.VITE_API_BASE_URL;

import axios from "axios";

export const api = axios.create({
    baseURL: apiUrl,
    withCredentials: true, // Include credentials for cookies/session handling
});

// Attach tokens to every request
api.interceptors.request.use(
    (config) => {
        console.log("Intercepting request:", config.url); // Debugging

        // Ensure skipping token attachment for registration
        if (config.url.includes("/auth/login") || 
            config.url.includes("/auth/register") || 
            config.url.includes("/trendingCrypto") || 
            config.url.includes("/trade"))  {
            console.log(`Skipping token attachment for: ${config.url}`);
            return config;
        }

        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            config.headers["x-auth-token"] = token; // Include x-auth-token for added compatibility
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


// Intercept responses for token expiration or other errors
// api.interceptors.response.use(
//     (response) => response, // Pass successful responses as-is
//     (error) => {
//         if (error.response?.status === 401) {
//             console.warn("Unauthorized. Redirecting to login.");
//             localStorage.removeItem("token"); // Remove token if unauthorized
//             window.location.href = "/login"; // Redirect to login page
//         }
//         return Promise.reject(error);
//     }
// );

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

