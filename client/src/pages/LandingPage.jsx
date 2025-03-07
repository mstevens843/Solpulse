import React, { useState, useEffect, useCallback, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import CryptoTicker from "@/components/Crypto_components/CryptoTicker";
import { api } from "@/api/apiConfig";
import { AuthContext } from "@/context/AuthContext";
import "@/css/pages/LandingPage.css";

function LandingPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [identifier, setIdentifier] = useState(localStorage.getItem("rememberedIdentifier") || "");
    const [email, setEmail] = useState(localStorage.getItem("rememberedEmail") || "");
    const [password, setPassword] = useState(localStorage.getItem("rememberedPassword") || "");
    const [rememberMe, setRememberMe] = useState(localStorage.getItem("rememberMe") === "true");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { setIsAuthenticated, setUser: setAuthUser } = useContext(AuthContext);

    const fetchUser = useCallback(async () => {
        try {
            const response = await api.get("/users/me");
            setUser(response.data);
        } catch (err) {
            console.error("Error fetching user data:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        if (rememberMe && email && password) {
            localStorage.setItem("rememberedEmail", email);
            localStorage.setItem("rememberedPassword", password);
        }
    }, [rememberMe, email, password]);

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
    
    // Update handleSubmit function
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
    
        if (!validateForm()) return;
    
        setLoading(true);
    
        const payload = {
            identifier: identifier.trim(),  // Either email or username
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
                    <CryptoTicker />
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
        </div>
    );
}

export default LandingPage;