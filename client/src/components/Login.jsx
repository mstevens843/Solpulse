import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/apiConfig";
import "@/css/pages/Login.css";
import { AuthContext } from "@/context/AuthContext";

const Login = ({ redirectPath = "/dashboard" }) => {
    const [email, setEmail] = useState(localStorage.getItem("rememberedEmail") || "");
    const [password, setPassword] = useState(localStorage.getItem("rememberedPassword") || "");
    const [rememberMe, setRememberMe] = useState(localStorage.getItem("rememberMe") === "true");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { setIsAuthenticated, setUser } = useContext(AuthContext);

    useEffect(() => {
        if (rememberMe && email && password) {
            localStorage.setItem("rememberedEmail", email);
            localStorage.setItem("rememberedPassword", password);
        }
    }, [rememberMe, email, password]);

    const validateForm = () => {
        if (!email.trim().includes("@")) {
            setError("Invalid email format.");
            return false;
        }
        if (password.trim().length < 6) {
            setError("Password must be at least 6 characters long.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!validateForm()) return;

        setLoading(true);

        try {
            console.log("Sending login request to /auth/login...");
            const response = await api.post("/auth/login", {
                email: email.trim(),
                password: password.trim(),
            });

            console.log("Login response:", response.data);

            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.user));

                if (rememberMe) {
                    localStorage.setItem("rememberedEmail", email);
                    localStorage.setItem("rememberedPassword", password);
                    localStorage.setItem("rememberMe", "true");
                } else {
                    localStorage.removeItem("rememberedEmail");
                    localStorage.removeItem("rememberedPassword");
                    localStorage.removeItem("rememberMe");
                }

                setUser(response.data.user);
                setIsAuthenticated(true);

                navigate(redirectPath);
            } else {
                setError("Login failed. Token not received.");
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError("Unable to log in. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-section">
            {loading ? (
                <p className="loading-text">Loading user information...</p>
            ) : (
                <>
                    <h2>Log in to your account</h2>
                    {error && (
                        <p className="login-error" role="alert" aria-live="assertive">
                            {error}
                        </p>
                    )}
                    <form onSubmit={handleSubmit} aria-label="Login form">
                        <input
                            type="email"
                            placeholder="Username or email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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

                        <div className="form-group remember-me">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={() => setRememberMe(!rememberMe)}
                            />
                            <label htmlFor="rememberMe">Remember Me</label>
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
    );
};

export default Login;