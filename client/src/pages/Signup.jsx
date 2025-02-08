import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "@/api/apiConfig"; 
import Loader from "@/components/Loader";
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

  const { username, email, password, confirmPassword, walletAddress } = formData;

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validate inputs
  const validateInputs = () => {
    const newErrors = {};

    // Username validation: at least 3 characters
    if (username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters long.";
    }

    // Email validation: Must be a common provider (Gmail, Yahoo, etc.)
    const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|outlook|hotmail|protonmail)\.com$/i;
    if (!emailPattern.test(email)) {
      newErrors.email = "Email must be from Gmail, Yahoo, Outlook, or ProtonMail.";
    }

    // Password validation: At least 8 characters, 1 uppercase letter, and 1 special character
    const passwordPattern = /^(?=.*[A-Z])(?=.*[\W]).{8,}$/;
    if (!passwordPattern.test(password)) {
      newErrors.password = "Password must have at least 8 characters, 1 uppercase letter, and 1 special character.";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    // Wallet Address validation: Check if it's a valid Solana address
    if (!walletAddress.trim()) {
      newErrors.walletAddress = "Wallet address is required.";
    } else if (!/^[A-HJ-NP-Za-km-z1-9]{32,44}$/i.test(walletAddress)) {
      newErrors.walletAddress = "Invalid Solana wallet address.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    if (!validateInputs()) return;
  
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

        toast.success("Signup successful! Redirecting to login page...", {
          position: "top-center",
          autoClose: 1500,
          onClose: () => navigate("/"),
        });
      } else {
        setErrors({ form: "Signup failed. Please try again." });
      }
    } catch (err) {
      console.error("Signup Error:", err.response?.data);

      if (err.response?.data?.errors) {
        // Handle Sequelize validation errors
        const formattedErrors = {};
        err.response.data.errors.forEach((error) => {
          formattedErrors[error.path] = error.message;
        });
        setErrors(formattedErrors);

        // Show error notification
        toast.error("Signup failed. Please check your inputs.", {
          position: "top-center",
          autoClose: 3000,
        });
      } else {
        setErrors({ form: err.response?.data?.message || "Signup failed. Please try again." });
      }
    } finally {
      setLoading(false);
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
            autoComplete="off"  // 🔥 Prevents autofill
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
            autoComplete="new-password"  // 🔥 Ensures Chrome doesn't autofill
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
    </div>
  );
};

export default Signup;
