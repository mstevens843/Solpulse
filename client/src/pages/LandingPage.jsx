/**
 * LandingPage.js - User Authentication & Entry Page for SolPulse
 *
 * This page is responsible for:
 * - Displaying the landing page with a login form.
 * - Handling user authentication (login).
 * - Redirecting authenticated users to the home page.
 * - Remembering login details if "Remember Me" is selected.
 * - Fetching user details on mount to determine login status.
 */


import React, { useState, useEffect, useCallback, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/api/apiConfig";
import { lazy, Suspense } from "react";
const CryptoTicker = lazy(() => import("@/components/Crypto_components/CryptoTicker"));
import { AuthContext } from "@/context/AuthContext";
import "@/css/pages/LandingPage.css";

function LandingPage() {
    // State management for user authentication
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    // Login form state
    const [identifier, setIdentifier] = useState(localStorage.getItem("rememberedIdentifier") || "");
    const [email, setEmail] = useState(localStorage.getItem("rememberedEmail") || "");
    const [password, setPassword] = useState(localStorage.getItem("rememberedPassword") || "");
    const [rememberMe, setRememberMe] = useState(localStorage.getItem("rememberMe") === "true");
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const { setIsAuthenticated, setUser: setAuthUser } = useContext(AuthContext);


    // Add State for Tracking Attempts
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [isCooldown, setIsCooldown] = useState(false);




    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/home");
        }
    }, [navigate]);



    /**
     * Fetch user data if logged in.
     * This function runs on mount to check if the user is already authenticated.
     * Now /users/me won’t fire off useless 401s if there’s no token.

     */
    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }
    
        try {
            const response = await api.get("/users/me", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
        } catch (err) {
            console.error("Error fetching user data:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Remember login credentials if "Remember Me" is checked
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        if (rememberMe && email && password) {
            localStorage.setItem("rememberedEmail", email);
            localStorage.setItem("rememberedPassword", password);
        }
    }, [rememberMe, email, password]);

    /**
     * Validate login form input fields before submitting.
     * @returns {boolean} True if form is valid, otherwise false.
     */
    const validateForm = () => {
        if (identifier.trim().length === 0) {
            setError("Email or Username is required.");
            return false;
        }
        if (password.trim().length < 6) {
            setError("Password must be at least 6 characters long.");
            return false;
        }
        return true;
    };
    
    /**
     * Handle login form submission.
     * - Sends credentials to the API for authentication.
     * - Stores token and user details in local storage upon successful login.
     * - Redirects the user to the home page.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
    
        if (isCooldown) {
            setError("Too many login attempts. Please wait 30 seconds before trying again.");
            return;
        }
    
        if (!validateForm()) return;
    
        setLoading(true);
    
        const payload = {
            identifier: identifier.trim(), // Either email or username
            password: password.trim(),
        };
    
        console.log("Sending login payload:", payload);
    
        try {
            const response = await api.post("/auth/login", payload);
            console.log("Login response:", response.data);
    
            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.user));
    
                if (rememberMe) {
                    localStorage.setItem("rememberedIdentifier", identifier);
                    localStorage.setItem("rememberedPassword", password);
                    localStorage.setItem("rememberMe", "true");
                } else {
                    localStorage.removeItem("rememberedIdentifier");
                    localStorage.removeItem("rememberedPassword");
                    localStorage.removeItem("rememberMe");
                }
    
                setAuthUser(response.data.user);
                setIsAuthenticated(true);
                navigate("/home");
            } else {
                setError("Login failed. Token not received.");
            }
        } catch (err) {
            console.error("Login Error:", err.response?.data || err.message);
            setError(err.response?.data?.error || "Unable to log in. Please try again later.");
    
            // ✅  Rate limit logic: 3 failed attempts trigger 30s cooldown
            setLoginAttempts((prev) => prev + 1);
            if (loginAttempts + 1 >= 3) {
                setIsCooldown(true);
                setTimeout(() => {
                    setIsCooldown(false);
                    setLoginAttempts(0);
                }, 30000); // ✅  30-second lockout
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="home-container">
            <div className="home-content">
                <div className="crypto-info">
                    <h1>Welcome to SolPulse</h1>
                    <p>Explore the world of Solana social media, share insights, and connect with like-minded enthusiasts.</p>
                    <Suspense fallback={<p>Loading crypto data...</p>}>
                        <CryptoTicker isCompact={true} />
                    </Suspense>
                </div>

                <div className="auth-section">
                    {loading ? (
                        <p className="loading-text">Loading user information...</p>
                    ) : user ? (
                        <div>
                            <p className="user-greeting">Hello, {user.username}!</p>
                            <button className="feed-button" onClick={() => navigate('/home')}>
                                Go to Home
                            </button>
                        </div>
                    ) : (
                        <>
                            <h2>Log in to your account</h2>
                            {error && (
                                <p className="login-error" role="alert">
                                    {error}
                                </p>
                            )}
                            <form onSubmit={handleSubmit} aria-label="Login form">
                                <input
                                    type="text"
                                    placeholder="Username or email"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    required
                                />
                                <div className="password-container">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <span
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="toggle-password"
                                    >
                                        {showPassword ? "🙈" : "👁️"}
                                    </span>
                                </div>

                                <div className="remember-me-container">
                                    <label htmlFor="rememberMe" className="remember-me-label">Remember Me</label>
                                    <input
                                        type="checkbox"
                                        id="rememberMe"
                                        checked={rememberMe}
                                        onChange={() => setRememberMe(!rememberMe)}
                                        className="remember-me-checkbox"
                                    />
                                </div>

                                <button type="submit" className="login-btn" disabled={loading}>
                                    {loading ? "Logging in..." : "Log In"}
                                </button>
                            </form>
                            <p>
                                Don't have an account?{" "}
                                <Link to="/signup" className="signup-link">Sign up</Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
            <button
                className="theme-toggle-btn"
                onClick={() => {
                    const isDark = document.documentElement.classList.contains("dark");
                    document.documentElement.classList.toggle("dark", !isDark);
                    localStorage.setItem("theme", isDark ? "light" : "dark");
                }}
                >
                🌓
            </button>
        </div>
    );
}

export default LandingPage;

/**
 * Potential Improvements:
 * - **Auto Redirect Logged-in Users:** If a user is already authenticated, they should be redirected immediately instead of waiting for API validation.
 * - **Rate Limiting on Login Attempts:** Implement a delay for multiple failed login attempts to prevent brute force attacks.
 * - **Security Improvements:**
 *   - Avoid storing passwords in localStorage, even when hashed. - SKIP 
 *   - Implement HTTP-only secure cookies for session storage instead of localStorage for authentication. - SKIP
 * - **Lazy Load CryptoTicker Component:** Since it's not critical to authentication, it can be lazy-loaded for faster performance.
 * - **Enhance UI Feedback:** Consider adding a loading spinner or animation during login attempts for better UX. - SKIP 
 */
