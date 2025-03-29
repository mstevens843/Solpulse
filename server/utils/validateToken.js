/**
 * JWT Validation Middleware for SolPulse
 *
 * - Extracts and verifies JWT token from the request.
 * - Ensures authentication before allowing access to protected routes.
 * - Throws an error if the token is missing or invalid.
 */

const jwt = require('jsonwebtoken');

/**
 * Validate JWT Token from Request Headers
 *
 * - Checks if the `Authorization` header contains a Bearer token.
 * - Verifies the token using the `JWT_SECRET` key.
 * - Throws an error if the token is missing or invalid.
 *
 * @param {Object} req - The Express request object.
 * @returns {Object} - The decoded token payload if valid.
 * @throws {Error} - If the token is missing or invalid.
 */
const validateToken = (req) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('Authorization token missing');

    // ✅ Check if secret key is defined
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    try {
        // ✅ Attempt to verify token
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        // ✅ Log failure details for debugging
        console.error(`Token validation failed: ${error.message}`);

        // ✅ Provide descriptive error messages
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token has expired. Please log in again.');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid authentication token.');
        }

        throw new Error('Token verification failed.');
    }
};

module.exports = validateToken;



/**
 * 🔍 Potential Issues & Optimizations
 * 
1️⃣ Lack of Secret Key Validation
Issue: If JWT_SECRET is missing from the environment variables, the app will crash.
✅ Fix: Add a check before verifying the token:
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}


2️⃣ No Error Handling for Invalid Tokens
Issue: If verification fails (e.g., expired token, invalid signature), it throws a generic error.
✅ Fix: Catch errors and provide more meaningful messages:
try {
    return jwt.verify(token, process.env.JWT_SECRET);
} catch (error) {
    if (error.name === "TokenExpiredError") {
        throw new Error("Token has expired. Please log in again.");
    }
    if (error.name === "JsonWebTokenError") {
        throw new Error("Invalid authentication token.");
    }
    throw new Error("Token verification failed.");
}

3️⃣ No Logging for Token Validation Failures
Issue: When verification fails, there's no logging to help debug issues.
✅ Fix: Add console.error() logging before throwing errors:
console.error(`Token validation failed: ${error.message}`);

4️⃣ Lack of Token Revocation Support
Issue: If a user logs out or their token needs to be revoked, this function does not check a blocklist.
✅ Fix: Implement a token blocklist (e.g., store invalidated tokens in Redis) and check against it.
 */