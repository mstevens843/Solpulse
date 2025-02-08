
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