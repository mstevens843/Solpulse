// Enhanced middleware for handling errors across all routes
const errorHandler = (err, req, res, next) => {
  console.error("Error passed to handler:", err);
  const statusCode = err.status || 500; // Use error's status code or default to 500
  const isProduction = process.env.NODE_ENV === 'production';

  // Log the error (structured logging for better debugging)
  console.error({
    message: err.message,
    stack: isProduction ? 'Hidden in production' : err.stack,
    status: statusCode,
    timestamp: new Date().toISOString(),
    ...(err.context ? { context: err.context } : {}), // Optionally log additional context
  });

  // Send a structured error response
  res.status(statusCode).json({
    error: {
      message: err.message || 'Server error',
      code: err.code || 'UNKNOWN_ERROR', // Add an error code to categorize errors
      ...(isProduction ? {} : { stack: err.stack }), // Include stack trace only in non-production environments
    },
  });
};

module.exports = errorHandler;




// Improvements
// Status Code Flexibility: Use the error object to dynamically set the HTTP status code. This ensures proper status codes (e.g., 400 for bad requests, 401 for unauthorized).
// Detailed Error Response: Include more details in development (e.g., stack trace) but keep it concise in production.
// Error Logging: Use structured logging for better debugging and analysis (e.g., include timestamps and differentiate between levels of logging).
// Environment-Specific Behavior: Avoid exposing sensitive information in production, like stack traces.