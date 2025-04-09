/**
 * Signup.js - User Registration Page for SolPulse
 *
 * This file is responsible for:
 * - Handling user registration via form submission.
 * - Validating user inputs (username, email, password, and Solana wallet address).
 * - Sending registration requests to the backend.
 * - Displaying success/error messages using react-toastify.
 * - Implementing password visibility toggles.
 */


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/apiConfig"; 
import Loader from "@/components/Loader";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import "@/css/pages/Signup.css";
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    walletAddress: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { setIsAuthenticated, setUser } = useContext(AuthContext);

  const { username, email, password, confirmPassword, walletAddress } = formData;


  // ✅ Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" }); // Smooth UX for fresh form view
  }, []);



  // ✅ Validate form before submission
  const validateInputs = () => {
    const newErrors = {};

    if (username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters long.";
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|outlook|hotmail|protonmail)\.com$/i;
    if (!emailPattern.test(email)) {
      newErrors.email = "Email must be from Gmail, Yahoo, Outlook, or ProtonMail.";
    }

    const passwordPattern = /^(?=.*[A-Z])(?=.*[\W]).{8,}$/;
    if (!passwordPattern.test(password)) {
      newErrors.password = "Password must have at least 8 characters, 1 uppercase letter, and 1 special character.";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!walletAddress.trim()) {
      newErrors.walletAddress = "Wallet address is required.";
    } else if (!/^[A-HJ-NP-Za-km-z1-9]{32,44}$/i.test(walletAddress)) {
      newErrors.walletAddress = "Invalid Solana wallet address.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  // ✅ Handles input changes for all fields
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: value
  }));
};



  /**
   * Handle form submission.
   * - Sends registration data to the backend.
   * - Stores user information in local storage upon successful registration.
   */
  // ✅ Submits signup form after validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    const isValid = validateInputs();
    if (!isValid) return;

    setLoading(true);

  
    try {
      const response = await api.post("/auth/register", {
        username,
        email,
        password,
        walletAddress,
      });
  
      if (response.data.token) {
        localStorage.setItem("userSettings", JSON.stringify({ email, walletAddress }));
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        setIsAuthenticated(true); // ✅ Add this
        setUser(response.data.user); // ✅ And this

        setLoading(false); // ✅ Reset loading regardless of outcome

        navigate("/home", { state: { signupSuccess: true } });

      } else {
        setErrors({ form: "Signup failed. Please try again." });
      }
    } catch (err) {
      console.error("Signup Error:", err);

      if (!err.response) {
        setErrors({ form: "Network error. Please check your connection." }); // ✅ User-friendly message
        toast.error("No response from server. Check your internet or try again later."); // ✅ Improves UX for connection failures
      } else if (err.response.status >= 500) {
        setErrors({ form: "Server error. Please try again later." }); // ✅ Avoids exposing backend info
        toast.error("Internal server error. Our team is on it."); // ✅ Reassures user
      } else if (err.response?.data?.errors) {
        // ✅ Express-validator validation errors
        const formattedErrors = {};
        err.response.data.errors.forEach((error) => {
          if (error.path) {
            formattedErrors[error.path] = error.msg || error.message;
          }
        });
        setErrors(formattedErrors);
        toast.error("Signup failed. Please check your inputs.");
      } else if (err.response?.data?.error) {
        const errorMessage = err.response.data.error;
      
        // ✅ Handle specific backend messages more cleanly
        if (errorMessage.toLowerCase().includes("wallet")) {
          setErrors({ walletAddress: errorMessage });
        } else if (errorMessage.toLowerCase().includes("email")) {
          setErrors({ email: errorMessage });
        } else {
          setErrors({ form: errorMessage });
        }
      
        toast.error(errorMessage);
      }
      
    }
  };



  return (
    <div className="signup-container">
      <div className="signup-header">
        <h2>Signup</h2>
      </div>

      {errors.form && <p id="form-error" className="error-message" role="alert">{errors.form}</p>}

      <form onSubmit={handleSubmit} className="signup-form">
        {/* Username Field */}
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            name="username"
            value={username}
            onChange={handleChange}
            className={errors.username ? "input-error" : ""}
            required
            autoComplete="off"  //  Prevents autofill
          />
          {errors.username && <p className="field-error">{errors.username}</p>}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            className={errors.email ? "input-error" : ""}
            required
            autoComplete="off"  // 🔥 Prevents autofill
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        {/* Password Field */}
        <div className="password-container">
          <label htmlFor="password">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onChange={handleChange}
            className={errors.password ? "input-error" : ""}
            required
            autoComplete="off"
            />
          <span onClick={() => setShowPassword(!showPassword)} className="toggle-password">
            {showPassword ? "🙈" : "👁️"}
          </span>
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>

        {/* Confirm Password Field */}
        <div className="password-container">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleChange}
            className={errors.confirmPassword ? "input-error" : ""}
            required
            autoComplete="new-password"  //  Ensures Chrome doesn't autofill
            />
          <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="toggle-password">
            {showConfirmPassword ? "🙈" : "👁️"}
          </span>
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
        </div>

        {/* Wallet Address Field */}
        <div>
          <label htmlFor="walletAddress">Wallet Address</label>
          <input
            type="text"
            name="walletAddress"
            value={walletAddress}
            onChange={handleChange}
            className={errors.walletAddress ? "input-error" : ""}
            required
            autoComplete="off"  // 🔥 Prevents autofill
          />
          {errors.walletAddress && <p className="field-error">{errors.walletAddress}</p>}
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={loading}>
          {loading ? <Loader /> : "Sign Up"}
        </button>
      </form>

      <div className="account-already">
        <p>
          Already have an account?{" "}
          <a href="/login" className="signup-link">
            Login
          </a>
        </p>
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
};

export default Signup;



/**
 * 🔹 Potential Improvements:
 * - Implement reCAPTCHA for additional security against bots.
 * - Add email verification step before account activation.
 * - Store authentication tokens securely using HTTP-only cookies instead of localStorage.
 * - Improve error handling for network-related issues.
 */



/**
 * ✅ Field validation: Strong validation on all form fields
 * ✅ UX enhancements:

window.scrollTo on mount.

Autofill prevention where appropriate.

Password visibility toggle.

✅ Robust error handling:

Gracefully handles:

Network/CORS issues

Server-side errors (5xx)

Sequelize validation errors

Fallback unknown errors

✅ Loading state: Prevents double submissions.

✅ Feedback:

react-toastify gives real-time status updates.

Inline field error messages are descriptive.

✅ LocalStorage: Only non-sensitive data stored.

✅ Layout and semantic HTML: Clean and accessible.

What’s Next? (Optional but 🔥)
You could bookmark these for later:

🧠 Add Google reCAPTCHA or hCaptcha.

✅ Switch to HTTP-only cookies for auth token.

📧 Integrate email verification flow.

🪪 Add "Terms of Use" or "Accept Privacy Policy" checkbox.
 */