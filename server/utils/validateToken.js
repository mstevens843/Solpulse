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
 */
const validateToken = (req) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('Authorization token missing');

    // Check if secret key is defined
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    try {
        //  Attempt to verify token
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        // Log failure details for debugging
        console.error(`Token validation failed: ${error.message}`);

        // Provide descriptive error messages
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