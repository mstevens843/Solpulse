# Front-End Authentication Guide

This document explains how authentication is handled on the **front-end** of the application. It covers how we store and manage tokens, how the `AuthContext` is used throughout the React application, and how we configure Axios for authenticated requests.

---

## Table of Contents

1. [Overview](#overview)  
2. [Getting Started](#getting-started)  
3. [AuthContext](#authcontext)  
   - [Initialization](#initialization)  
   - [Usage in Components](#usage-in-components)  
4. [Axios Configuration (`apiConfig.jsx`)](#axios-configuration-apiconfigjsx)  
5. [User Service (`userService.jsx`)](#user-service-userservicjsx)  
6. [Error Handling & Notes](#error-handling--notes)

---

## Overview

The front-end uses **React Context** to manage authentication state (user info, login status, etc.), and **Axios** interceptors to attach JWT tokens to outgoing requests. Tokens are stored in `localStorage` for persistence across page reloads.

---

## Getting Started

1. **Install dependencies**:
    
    npm install

2. **Start the app**:
    
    npm run start

3. **Access**: By default, the React app will run at `http://localhost:3000` (or another port if configured).

---

## AuthContext

**Location**:  
`src/context/AuthContext.jsx`

This context provider wraps your entire app and handles:

- Retrieving an existing token from `localStorage` on first load.  
- Fetching user data via `/auth/me` if a valid token is found.  
- Storing user details (and token) so other components can access them.  
- Maintaining liked/retweeted posts (if your project includes social features) in React state and `sessionStorage`.

### Initialization

    import React, { createContext, useState, useEffect } from "react";
    import { api } from "@/api/apiConfig"; // pre-configured Axios instance

    export const AuthContext = createContext();

    export const AuthProvider = ({ children }) => {
      const [user, setUser] = useState(null);
      const [isAuthenticated, setIsAuthenticated] = useState(false);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
          const token = localStorage.getItem("token");
          if (token) {
              fetchCurrentUser();
          } else {
              setLoading(false);
          }
      }, []);

      const fetchCurrentUser = async () => {
          try {
              const response = await api.get("/auth/me");
              setUser(response.data);
              setIsAuthenticated(true);
              localStorage.setItem("user", JSON.stringify(response.data));
          } catch (error) {
              console.error("Error fetching user data:", error);
              localStorage.removeItem("token");
              setIsAuthenticated(false);
          } finally {
              setLoading(false);
          }
      };

      if (loading) return <div>Loading...</div>;

      return (
          <AuthContext.Provider
              value={{
                  user,
                  setUser,
                  isAuthenticated,
                  setIsAuthenticated,
              }}
          >
              {children}
          </AuthContext.Provider>
      );
    };

- On app load, `AuthProvider` checks `localStorage` for a `token`.
- If a token is found, it calls `/auth/me` to verify the token and retrieve the user’s profile.
- If successful, it sets `user` and `isAuthenticated`.
- If any error occurs (e.g., invalid token), it removes the token from `localStorage` and sets `isAuthenticated` to `false`.
- Other components can access these states (`user`, `isAuthenticated`, etc.) via `AuthContext`.

### Usage in Components

    // index.js
    import React from "react";
    import ReactDOM from "react-dom/client";
    import App from "./App";
    import { AuthProvider } from "@/context/AuthContext";

    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(
      <React.StrictMode>
        <AuthProvider>
          <App />
        </AuthProvider>
      </React.StrictMode>
    );

Then, **consume** the context in child components:

    import React, { useContext } from "react";
    import { AuthContext } from "@/context/AuthContext";

    function Dashboard() {
      const { user, isAuthenticated } = useContext(AuthContext);

      if (!isAuthenticated) return <p>Please log in.</p>;

      return <h1>Welcome, {user.username}!</h1>;
    }

    export default Dashboard;

---

## Axios Configuration (`apiConfig.jsx`)

**Location**:  
`src/api/apiConfig.jsx`

This file configures **Axios** to automatically include tokens in requests.

    import axios from "axios";

    // API base URL from environment
    export const apiUrl = import.meta.env.VITE_API_BASE_URL;

    export const api = axios.create({
      baseURL: apiUrl,
      withCredentials: true,
    });

    // Excluded routes (no token needed)
    const excludedRoutes = ["/auth/login", "/auth/register", "/trendingCrypto", "/trade"];

    api.interceptors.request.use(
      (config) => {
        // Skip token for certain routes
        const shouldSkip = excludedRoutes.some(route => config.url.includes(route));
        if (shouldSkip) {
          return config;
        }

        // Attach token
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          config.headers["x-auth-token"] = token;
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
      const headers = { "Content-Type": contentType };
      if (token) {
        if (useBearer) {
          headers.Authorization = `Bearer ${token}`;
        } else {
          headers["x-auth-token"] = token;
        }
      }
      return headers;
    };

### How It Works

- On every outgoing request, the interceptor checks if the endpoint is excluded (e.g., `/auth/login`, `/auth/register`).  
- If not excluded, it retrieves the token from `localStorage` and adds it to both `Authorization` and `x-auth-token` headers.  
- Any request to a protected endpoint automatically includes these headers if a token is present.

---

## User Service (`userService.jsx`)

**Location**:  
`src/api/userService.jsx`

Provides higher-level APIs for user data fetching, handling retries, etc.

    import { api } from "./apiConfig";

    export const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token is missing. User is not authenticated.");
      }

      const retryFetch = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            const response = await api.get("/users/me");
            return response;
          } catch (error) {
            if (i === retries - 1) throw error;
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
          throw new Error("User data not found in response.");
        }
        return response.data.user;
      } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
      }
    };

**Notes**:
- Checks for a token, attempts up to 3 retries, and throws an error if it fails.  
- If successful, returns the `user` object from the response.

---

## Error Handling & Notes

1. **Token Storage**:  
   - The app stores `token` in `localStorage`. On logout or token expiration, remove it to prevent stale data.

2. **Interceptor**:  
   - If no token is found, certain requests fail with `401` or `403`. Handle gracefully (redirect to login, show a warning, etc.).

3. **Security**:  
   - Storing tokens in `localStorage` is straightforward but can be vulnerable to XSS. For higher security, consider using **HTTP-only cookies**.

4. **Handling Logout**:  
   - Clear `token` from `localStorage`.  
   - Optionally, hit the `/auth/logout` endpoint to clear a server-side session or cookie.  
   - Reset any relevant states in the `AuthContext` (e.g., `isAuthenticated = false; user = null`).

5. **Additional Features**:  
   - If you track “likes” or “retweets” in session/local storage, ensure this logic is only run for authenticated users.  

---
