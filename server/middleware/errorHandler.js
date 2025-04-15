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