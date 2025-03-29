// Enhanced middleware for handling errors across all routes

/**
 * Global Error Handling Middleware for SolPulse API
 *
 * - Catches and processes errors across all routes.
 * - Logs errors with structured logging for easier debugging.
 * - Returns structured JSON error responses.
 */


const errorHandler = (err, req, res, next) => {
  console.error("Error passed to handler:", err);
  const statusCode = err.status || 500; 
  const isProduction = process.env.NODE_ENV === 'production';


   /**
   * Structured Error Logging
   *
   * - Logs error messages, stack traces (except in production), and metadata.
   * - Helps in debugging by providing detailed error context.
   */
  console.error({
    message: err.message,
    stack: isProduction ? 'Hidden in production' : err.stack,
    status: statusCode,
    timestamp: new Date().toISOString(),
    ...(err.context ? { context: err.context } : {}), 
  });


   /**
   * Send a JSON-formatted error response.
   *
   * - Includes `message`, `code`, and optionally the `stack` (for non-production environments).
   */

  res.status(statusCode).json({
    error: {
      message: err.message || 'Server error',
      code: err.code || 'UNKNOWN_ERROR', 
      ...(isProduction ? {} : { stack: err.stack }),  // Exclude stack in production for security
    },
  });
};

module.exports = errorHandler;



/**
 * 🔍 Potential Issues & Optimizations
1️⃣ No Handling for Specific Error Types (Validation, Auth, DB Errors)

Issue: Right now, all errors are treated the same, even validation errors.
✅ Fix: Differentiate between error types using a switch statement:
switch (err.name) {
    case "ValidationError":
        statusCode = 400;
        break;
    case "JsonWebTokenError":
        statusCode = 401;
        err.message = "Invalid authentication token.";
        break;
    case "SequelizeDatabaseError":
        statusCode = 500;
        err.message = "Database error occurred.";
        break;
}


2️⃣ No User-Friendly Messages for Known Errors
Issue: Users receive raw error messages, which may not be user-friendly.
✅ Fix: Provide clear, user-friendly responses while keeping debugging details internally logged:
javascript
Copy
Edit
const userFriendlyMessage = isProduction
    ? "Something went wrong. Please try again later."
    : err.message;
res.status(statusCode).json({ error: { message: userFriendlyMessage, code: err.code || "UNKNOWN_ERROR" } });


3️⃣ Lack of a Standardized Error Class
Issue: Different parts of the app might throw errors inconsistently (e.g., raw strings vs. objects).
✅ Fix: Use a centralized ExpressError class:
class ExpressError extends Error {
    constructor(message, status, code = "UNKNOWN_ERROR", context = null) {
        super(message);
        this.status = status;
        this.code = code;
        this.context = context;
    }
}
module.exports = ExpressError;
Now, when throwing an error, use:
throw new ExpressError("Invalid token", 401, "AUTH_ERROR");



4️⃣ No Rate-Limiting or Auto-Muting for Excessive Errors

Issue: If an attacker spams invalid requests, the error logs can flood the system.
✅ Fix: Implement rate-limited logging to avoid log spam:
let errorCount = 0;
setInterval(() => { errorCount = 0; }, 60000); // Reset every minute
if (errorCount < 5) {
    console.error({ message: err.message, status: statusCode });
    errorCount++;
}
 */