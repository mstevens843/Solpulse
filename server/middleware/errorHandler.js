// Enhanced middleware for handling errors across all routes
const errorHandler = (err, req, res, next) => {
  console.error("Error passed to handler:", err);
  const statusCode = err.status || 500; 
  const isProduction = process.env.NODE_ENV === 'production';

  // Log the error (structured logging for better debugging)
  console.error({
    message: err.message,
    stack: isProduction ? 'Hidden in production' : err.stack,
    status: statusCode,
    timestamp: new Date().toISOString(),
    ...(err.context ? { context: err.context } : {}), 
  });

  // Send a structured error response
  res.status(statusCode).json({
    error: {
      message: err.message || 'Server error',
      code: err.code || 'UNKNOWN_ERROR', 
      ...(isProduction ? {} : { stack: err.stack }), 
    },
  });
};

module.exports = errorHandler;