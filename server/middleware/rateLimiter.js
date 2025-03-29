
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
 *
 * @param {Object} options - Configuration options for rate limiting.
 * @param {number} options.limit - Maximum requests allowed per time window.
 * @param {number} options.windowMs - Time window in milliseconds.
 * @param {string|Object} options.message - Custom error message for rate limits.
 * @param {boolean} options.headers - Whether to send rate limit headers.
 * @returns {Function} - Express middleware function for rate limiting.
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


/**
 * 🔍 Potential Issues & Optimizations
1️⃣ No Differentiation Between Authenticated & Unauthenticated Users

Issue: Logged-in users should be rate-limited by user.id, while guests should be limited by IP.
✅ Fix: Adjust the keyGenerator logic:
keyGenerator: (req) => {
    if (req.user) return `user-${req.user.id}`;
    return `ip-${req.ip}`;
};


2️⃣ Single Global Rate Limit for All Routes
Issue: Some routes (e.g., login or password reset) should have stricter limits than others.
✅ Fix: Allow custom rate limits per route:
const loginRateLimiter = rateLimiter({ limit: 5, windowMs: 5 * 60 * 1000 }); // Stricter limit for login
app.post("/auth/login", loginRateLimiter, loginHandler);


3️⃣ No Exemptions for Admins or Trusted Users
Issue: Admins or certain user roles might need to bypass rate limiting.
✅ Fix: Exclude specific users from rate limits:
if (req.user?.role === "admin") return next(); // Skip rate limit for admins


4️⃣ Lack of IP-Based Blocklist for Abusive Users
Issue: If a user continuously hits the rate limit, they should be temporarily blocked.
✅ Fix: Implement an IP blocklist:
const blockedIPs = new Set();
if (blockedIPs.has(req.ip)) {
    return res.status(403).json({ error: "Too many requests. IP temporarily blocked." });
}

5️⃣ No Logging for Rate-Limited Requests
Issue: There's no way to monitor who is hitting rate limits frequently.
✅ Fix: Add logging for excessive requests:

console.warn(`[${new Date().toISOString()}] Rate limit exceeded: ${req.method} ${req.url} - IP: ${req.ip}`);
 */