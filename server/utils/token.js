/**
 * JWT Utility for SolPulse Authentication
 * 
 * - Generates, verifies, and decodes JWT tokens.
 * - Ensures secure authentication with proper validation.
 * - Handles token-related errors effectively.
 */


require("dotenv").config();
const jwt = require("jsonwebtoken");

/**
 * Helper function to generate JWT token
 * 
 * - Signs a payload with `JWT_SECRET` to create a token.
 * - Ensures payload is a valid object before signing.
 * - Default expiration is set to 7 days ✅ (was previously too long)
 */
const generateToken = (payload, expiresIn = "7d") => { // ✅ reduced expiration
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in the environment variables");
    }

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new Error("Payload for JWT must be a valid object");
    }

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Helper function to verify JWT token
 * 
 * - Validates and decodes a JWT using `JWT_SECRET`.
 * - Handles expired or invalid token errors.
 */
const verifyToken = (token) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in the environment variables");
    }

    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        console.error(`Token verification failed: ${error.message}`); // ✅ Added logging
        if (error.name === "TokenExpiredError") {
            throw new Error("Token has expired");
        }
        if (error.name === "JsonWebTokenError") {
            throw new Error("Invalid token");
        }
        throw new Error("Token verification failed");
    }
};

/**
 *  Helper function to decode JWT token (without verification)
 * 
 * - Decodes a JWT token without verifying its authenticity. 
 * - Useful for extracting payload data without validation. 
 */
const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch {
        return null;
    }
};

/**
 * Validate JWT Token from Request 
 * 
 * - Extracts and verifies JWT token from the `Authorization` header.
 * - Ensures that the token is valid before allowing access. 
 */
const validateToken = (req) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("Authorization token missing");

    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
    generateToken,
    verifyToken,
    decodeToken,
    validateToken,
};



/**
 * 🔍 Potential Issues & Optimizations
1️⃣ Extremely Long Token Expiration (500,000 hours ≈ 57 years)
Issue: Setting an expiration this long defeats the purpose of expiring tokens for security.
✅ Fix: Reduce the default expiration to something reasonable, like 1 day (24h) or 7 days (7d):
const generateToken = (payload, expiresIn = "7d");


2️⃣ No Refresh Token Implementation
Issue: Once a token expires, users must log in again.
✅ Fix: Implement a refresh token system where a secondary token is issued with a longer expiration, allowing users to request a new access token without re-login.


3️⃣ Missing Error Logging
Issue: When token verification fails, it throws an error but does not log details for debugging.
✅ Fix: Add logging to verifyToken() for better error tracing:
console.error(`Token verification failed: ${error.message}`);
 */

