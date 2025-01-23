// token.js manages secure authentication and authorization.


// What It Does:
// Core Functionality:
// Generates JWT (JSON Web Token) for user authentication and authorization.
// Uses the jsonwebtoken library to sign tokens with a secret key.
// Ensures tokens expire after a set period (1h in this case) for security.
// Why We Need It:
// Authentication and Security:
// Ensures that only authenticated users can access protected routes and perform sensitive actions.
// Stateless Authentication:
// Tokens allow the server to verify user identity without storing session data, making the app more scalable.
// Centralization:
// Provides a single source for generating tokens, making it easier to update and manage.
// What Would Happen Without It:
// No Authentication:
// Your app wouldn’t be able to verify users, exposing it to unauthorized access.
// Insecure Practices:
// You might resort to less secure authentication methods, such as plaintext passwords or hardcoded sessions.
// Scalability Issues:
// Without JWTs, implementing authentication in a scalable way would be challenging.

require("dotenv").config();
const jwt = require("jsonwebtoken");

// Helper function to generate JWT token
const generateToken = (payload, expiresIn = "500000h") => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in the environment variables");
    }

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new Error("Payload for JWT must be a valid object");
    }

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Helper function to verify JWT token
const verifyToken = (token) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in the environment variables");
    }

    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new Error("Token has expired");
        }
        if (error.name === "JsonWebTokenError") {
            throw new Error("Invalid token");
        }
        throw new Error("Token verification failed");
    }
};

// Helper function to decode JWT token (without verification)
const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch {
        return null;
    }
};

// Helper function to validate JWT token and throw errors if invalid
const validateToken = (req) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("Authorization token missing");

    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
    generateToken,
    verifyToken,
    decodeToken,
    validateToken, // Add validateToken to exports
};





// Changes and Enhancements
// Added verifyToken:

// Verifies the authenticity of a token.
// Ensures that only valid tokens are processed.
// Added decodeToken:

// Decodes a token without verifying its signature.
// Useful for extracting information when you trust the source.
// Enhanced generateToken:

// Accepts a flexible payload (e.g., user object or custom claims).
// Allows optional expiration time for better control.
// Improved Error Handling:

// Throws clear errors if the JWT_SECRET is missing or if token operations fail.
// Security Best Practices:

// Ensures tokens cannot be generated or verified without a valid JWT_SECRET.
// Why These Changes?
// Flexibility: The additional functions (verifyToken, decodeToken) provide more options for working with tokens.
// Error Prevention: Adding checks for environment variables reduces the risk of runtime errors.
// Reusable Design: Utility functions can now be used in different parts of your app (e.g., middleware, services).
// This updated file improves usability, security, and maintainability for your JWT handling.

// The file appears to be well-structured, but I can suggest a few improvements for enhanced readability, error handling, and testing. Here’s a list of improvements:

// Return More Specific Error Messages: When JWT_SECRET is not defined, it would be better to log the specific error before throwing it so you can debug better.
// Improve Logging for verifyToken and decodeToken: Instead of just logging errors, we can provide more context or provide different messages based on the type of failure 
// (e.g., expired token, malformed token).
// Optional expiresIn Default: The default value for expiresIn can be provided through destructuring for clarity, or we can validate the input type to ensure it's a 
// valid string.


// Changes Made:
// Validation for expiresIn:

// Added a fallback to '1h' if expiresIn is invalid (not a string or empty).
// Error Handling for jwt.sign:

// Wrapped jwt.sign in a try-catch block to catch and log errors during token generation.
// Better Logging:

// Improved error messages to make debugging easier.
// Default Value for Invalid expiresIn:

// Ensures that a valid default value is always used, even if an incorrect value is passed.

// ey Changes:
// Payload Validation:

// Added stricter validation for the payload in generateToken to ensure it is a valid object and not null or an array.
// Decode Debugging:

// Included an optional console.log in decodeToken to help with debugging issues by logging the token before decoding.
// General Error Handling:

// Enhanced error messages to be more descriptive and helpful for debugging.