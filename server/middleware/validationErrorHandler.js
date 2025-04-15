/**
 * Validation Error Handling Middleware for SolPulse API
 *
 * - Processes validation errors from `express-validator`.
 * - Formats errors for consistency in API responses.
 * - Logs errors in non-production environments for debugging.
 */

const { validationResult } = require('express-validator');
const i18next = require('i18next');

// Optional: Track repeated failed requests in memory
const failedRequests = new Map();

const validationErrorHandler = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const rawErrors = errors.array();

    // Format & translate each error
    const formattedErrors = rawErrors.map((err) => ({
      field: err.param || 'unknown',
      message: i18next.exists(err.msg)
        ? i18next.t(err.msg, { lng: req.language || 'en' })
        : err.msg,
      critical: err.critical || false, // Optional severity tagging
    }));

    // Separate critical errors
    const criticalErrors = formattedErrors.filter((e) => e.critical);

    // Log error attempts (rate-limitable)
    const key = req.user?.id ? `user-${req.user.id}` : `ip-${req.ip}`;
    failedRequests.set(key, (failedRequests.get(key) || 0) + 1);

    if (process.env.NODE_ENV !== 'production') {
      console.error(`Validation errors for ${key}:`, formattedErrors);
    }

    // Adjust response for frontend clients
    const acceptsHtml = req.headers['accept']?.includes('text/html');
    const isCritical = criticalErrors.length > 0;

    if (acceptsHtml) {
      return res.status(400).send('Validation failed. Please check your inputs.');
    }

    if (isCritical) {
      return res.status(422).json({
        status: 'error',
        message: 'Critical validation errors detected',
        details: criticalErrors,
      });
    }

    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      details: formattedErrors,
    });
  }

  next();
};

module.exports = validationErrorHandler;