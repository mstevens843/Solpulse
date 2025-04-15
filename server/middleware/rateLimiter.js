
/**
 * API Rate Limiting Middleware for SolPulse
 *
 * - Limits the number of requests a user can make within a time window.
 * - Uses IP, user ID, or a test header (`x-test-user`) to track unique users.
 * - Returns structured error responses and `Retry-After` headers.
 */


const rateLimit = require("express-rate-limit");


/**
 * Rate Limiting Middleware Factory
 *
 * - Restricts the number of requests from a single user within a time window.
 * - Uses customizable settings for limits, time windows, and response headers.
 * - Provides a custom handler that returns structured error messages.
 */

const rateLimiter = ({ limit = 100, windowMs = 15 * 60 * 1000, message, headers = true } = {}) => {
    return rateLimit({
        windowMs, // Time window in milliseconds
        max: limit, // Maximum number of requests per window
        standardHeaders: headers, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable `X-RateLimit-*` headers
        message: message || {
            error: "Too many requests, please try again later.",
        },

                /**
         * Custom error response handler
         *
         * - Sets a `Retry-After` header with the remaining cooldown time.
         * - Returns a structured JSON response with an error message.
         */
        handler: (req, res, next, options) => {
            const retryAfter = Math.ceil(options.windowMs / 1000);
            res.setHeader("Retry-After", retryAfter);
            res.status(options.statusCode || 429).json({
                error: "Too many requests, please try again later.",
                retryAfter,
            });
        },


                /**
         * Key Generator for Rate Limiting
         *
         * - Uses the user ID (if authenticated) for better tracking.
         * - Falls back to IP address when user ID is unavailable.
         * - Allows testing overrides via the `x-test-user` header.
         */
        keyGenerator: (req) => {
            // Generate a unique key for each user (e.g., IP or user ID)
            return req.headers["x-test-user"] || req.user?.id || req.ip;
        },
    });
};

module.exports = rateLimiter;