const rateLimit = require("express-rate-limit");

const rateLimiter = ({ limit = 100, windowMs = 15 * 60 * 1000, message, headers = true } = {}) => {
    return rateLimit({
        windowMs, // Time window in milliseconds
        max: limit, // Maximum number of requests per window
        standardHeaders: headers, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable `X-RateLimit-*` headers
        message: message || {
            error: "Too many requests, please try again later.",
        },
        handler: (req, res, next, options) => {
            const retryAfter = Math.ceil(options.windowMs / 1000);
            res.setHeader("Retry-After", retryAfter);
            res.status(options.statusCode || 429).json({
                error: "Too many requests, please try again later.",
                retryAfter,
            });
        },
        keyGenerator: (req) => {
            // Generate a unique key for each user (e.g., IP or user ID)
            return req.headers["x-test-user"] || req.user?.id || req.ip;
        },
    });
};

module.exports = rateLimiter;

  





// Memory Cleanup: We should clear outdated timestamps after the window expires to prevent memory bloat over time.
// Custom Error Message: Allow customization of the error message, such as providing details on the time to wait until the next allowed request.
// Flexible Time Window: The windowMs parameter is already flexible, but we could enhance it to include more granular control, such as 
// adjusting the rate limit based on user roles or request types.
// Add logging: You might want to log rate limit breaches for better monitoring.