const { validationResult } = require('express-validator');

const validationErrorHandler = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.param || 'unknown', // Ensure the field name is correctly assigned
      message: err.msg, // Include the error message
    }));

    if (process.env.NODE_ENV !== 'production') {
      console.error('Validation errors:', formattedErrors);
    }

    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      details: formattedErrors, // Send formatted errors in the response
    });
  }

  next(); // Proceed if no errors
};

module.exports = validationErrorHandler;



// Enhancements in This Version:
// Standardized Error Response:

// Groups validation errors into a consistent structure under an error key, which can be useful for front-end error handling.
// Error Details:

// Provides additional information, such as the field (param), error message (msg), and the invalid value (value).
// Clearer Messaging:

// Includes a top-level message to summarize the error (e.g., "Validation failed").

// Improvements:
// Validation Rules Reusability: The validation logic for the user registration is modular, so if you need to reuse this, you can just import userValidationRules and 
// apply it to other routes.
// Detailed Error Response: The error responses now include the field name and the specific error message, making it much easier to debug issues on the client side

// Improvements to validationErrorHandler
// The existing implementation is already functional, but a few improvements can make it more robust and maintainable:

// Custom Error Message: Allow the possibility of custom error messages to be passed in the middleware for more flexibility.
// Logging Errors: Add error logging for debugging purposes in development, which will help track validation issues.
// Consistent Structure: Maintain a consistent structure for error handling and consider adding a status field for better clarity in the response.