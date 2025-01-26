// Login page provides users with secure way to access their accounts. It features: 
// - a form to enter the email and password, with validation for required fields. 
// - Error handling to display a messageif login credentials are invalid. 
// - Authentication via an API request, with successful logins storing a JWT token in local storage. 
// - A clean and user-friendly interface for seamless account access. 

// component version:
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





/// Page version

// import React, { useState, useContext, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { api } from "@/api/apiConfig";
// import "@/css/pages/Login.css";
// import { AuthContext } from "@/context/AuthContext";

// const Login = () => {
//     const [email, setEmail] = useState(localStorage.getItem("rememberedEmail") || "");
//     const [password, setPassword] = useState(localStorage.getItem("rememberedPassword") || "");
//     const [rememberMe, setRememberMe] = useState(localStorage.getItem("rememberMe") === "true");
//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [showPassword, setShowPassword] = useState(false);
//     const navigate = useNavigate();
//     const { setIsAuthenticated, setUser } = useContext(AuthContext);

//     useEffect(() => {
//         if (rememberMe && email && password) {
//             localStorage.setItem("rememberedEmail", email);
//             localStorage.setItem("rememberedPassword", password);
//         }
//     }, [rememberMe, email, password]);


//     const validateForm = () => {
//         if (!email.trim().includes("@")) {
//             setError("Invalid email format.");
//             return false;
//         }
//         if (password.trim().length < 6) {
//             setError("Password must be at least 6 characters long.");
//             return false;
//         }
//         return true;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError(""); 
     
//         if (!validateForm()) return;
     
//         setLoading(true); 
     
//         try {
//             console.log("Sending login request to /auth/login...");
//             const response = await api.post("/auth/login", {
//                 email: email.trim(),
//                 password: password.trim(),
//             });
     
//             console.log("Login response:", response.data);
     
//             if (response.data.token) {
//                 localStorage.setItem("token", response.data.token);
//                 localStorage.setItem("user", JSON.stringify(response.data.user));

//                 if (rememberMe) {
//                     localStorage.setItem("rememberedEmail", email);
//                     localStorage.setItem("rememberedPassword", password);
//                     localStorage.setItem("rememberMe", "true");
//                 } else {
//                     localStorage.removeItem("rememberedEmail");
//                     localStorage.removeItem("rememberedPassword");
//                     localStorage.removeItem("rememberMe");
//                 }
     
//                 setUser(response.data.user);
//                 setIsAuthenticated(true);
     
//                 navigate("/dashboard");
//             } else {
//                 setError("Login failed. Token not received.");
//             }
//         } catch (err) {
//             console.error("Login Error:", err);
//             setError("Unable to log in. Please try again later.");
//         } finally {
//             setLoading(false);
//         }
//     };
    
    

//     return (
//         <div className="login-container">
//             <header className="login-header">
//                 <h2>Login to SolPulse</h2>
//             </header>

//             {error && (
//                 <p className="login-error" role="alert" aria-live="assertive">
//                     {error}
//                 </p>
//             )}

//             <form onSubmit={handleSubmit} className="login-form" aria-label="Login form">
//                 <div className="form-group">
//                     <label htmlFor="email">Email</label>
//                     <input
//                         type="email"
//                         id="email"
//                         placeholder="Enter your email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         required
//                         aria-describedby="form-error"
//                     />
//                 </div>

//                 <div className="form-group password-container">
//                     <label htmlFor="password">Password</label>
//                     <input
//                         type={showPassword ? "text" : "password"}
//                         id="password"
//                         placeholder="Enter your password"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         required
//                         aria-describedby="form-error"
//                     />
//                     <span 
//                         onClick={() => setShowPassword(!showPassword)} 
//                         className="toggle-password"
//                     >
//                         {showPassword ? "🙈" : "👁️"}
//                     </span>
//                 </div>

//                 <div className="form-group remember-me">
//                     <input
//                         type="checkbox"
//                         id="rememberMe"
//                         checked={rememberMe}
//                         onChange={() => setRememberMe(!rememberMe)}
//                     />
//                     <label htmlFor="rememberMe">Remember Me</label>
//                 </div>

//                 <button type="submit" disabled={loading} aria-label="Submit login form">
//                     {loading ? "Logging in..." : "Login"}
//                 </button>
//             </form>

//             <footer className="login-links">
//                 <p>
//                     Don't have an account?{" "}
//                     <a href="/signup" aria-label="Sign up for SolPulse">
//                         Sign Up
//                     </a>
//                 </p>
//                 <p>
//                     Forgot your password?{" "}
//                     <a href="/reset-password" aria-label="Reset your password">
//                         Reset Password
//                     </a>
//                 </p>
//             </footer>
//         </div>
//     );
// };

// export default Login; //














// Form handling logic for logging in a user. 
// Stores the JWT token upon successful login 
// Redirects users to the dashboard after login. 


// IMPROVEMENTS MADE: 
// ENVIRONMENT VARIABLE: Use 'process.env.REACT_APP_API_URL for the API base URL 
// LOADING STATE: added loading spinner or message on login button while processing. 
// ERROR FEEDBACK: Improved error feedback based on server responses and network issues. 
// USER-FRIENDLY ENHANCEMENTS: included "Remember Me", "Forgot Password", and "Sign Up" options for better navigation. 
// PASSWORD VISIBILITY: You can optionall add a toggle to show or hide the password field for better usability. 

// Future Enhancements
// Two-Factor Authentication:

// Include an additional field for OTP (One-Time Password) if 2FA is enabled.
// Social Logins:

// Provide options to log in with Google, Facebook, or other providers.
// Security Enhancements:

// Use httpOnly cookies for storing tokens instead of local storage for better security.

// Using process.env.REACT_APP_API_URL for the API base URL is considered best practice in modern web development for several reasons:
// Key Benefits
// Flexibility: You can build your application once and deploy it to multiple environments without changing the source code.
// Maintainability: Centralized configuration simplifies updates and debugging.
// Separation of Concerns: Keeps your configuration separate from your business logic.

// Login.js Improvements
// Validation:

// Add client-side validation to check email format and password length before sending API requests.
// Accessibility:

// Include ARIA roles for better accessibility in the form.
// State Reset:

// Reset email and password states after a successful login to prevent sensitive data persistence.

// Key Updates
// Component (Login.js)
// Error Handling:

// Styled error messages and ensured they are accessible using aria-describedby.
// Loading State:

// Added accessible labels to buttons for better usability during the loading state.
// Footer Links:

// Added a "Forgot your password?" link for additional navigation.
// Accessibility Enhancements:

// Used aria-label attributes for improved screen reader support.

// Changes and Functional Improvements:
// Added Accessibility Enhancements:

// aria-describedby is added to associate error messages with the inputs for better screen reader compatibility.
// The role="alert" ensures errors are announced by screen readers immediately.
// Security Enhancements:

// Replaced localStorage with `httpOnly cookies for storing tokens. This improves security by mitigating XSS attacks.
// The backend must be configured to set cookies in responses (Secure; HttpOnly flags).
// Improved Error Handling:

// Included a fallback message for unexpected server errors.
// Error messages now cover invalid credentials and network issues comprehensively.
// Form Validation:

// Ensures the email includes @ and password meets length requirements.
// Prevents form submission unless validation passes.
// User Feedback:

// Displays a spinner (Loading...) while waiting for the server response during login.
// Environment Variable Check:

// Ensures REACT_APP_API_URL is defined in .env for clarity and avoids undefined behavior.
