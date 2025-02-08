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