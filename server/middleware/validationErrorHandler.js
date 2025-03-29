/**
 * Validation Error Handling Middleware for SolPulse API
 *
 * - Processes validation errors from `express-validator`.
 * - Formats errors for consistency in API responses.
 * - Logs errors in non-production environments for debugging.
 */

const { validationResult } = require('express-validator');
const i18next = require('i18next');


/**
 * Middleware to Handle Validation Errors
 *
 * - Extracts validation errors from the request.
 * - Formats errors into a structured response.
 * - Logs errors in development mode for debugging.
 *  *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */

// Optional: Track repeated failed requests in memory
const failedRequests = new Map();

const validationErrorHandler = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const rawErrors = errors.array();

    // ✅ Format & translate each error
    const formattedErrors = rawErrors.map((err) => ({
      field: err.param || 'unknown',
      message: i18next.exists(err.msg)
        ? i18next.t(err.msg, { lng: req.language || 'en' })
        : err.msg,
      critical: err.critical || false, // Optional severity tagging
    }));

    // ✅ Separate critical errors
    const criticalErrors = formattedErrors.filter((e) => e.critical);

    // ✅ Log error attempts (rate-limitable)
    const key = req.user?.id ? `user-${req.user.id}` : `ip-${req.ip}`;
    failedRequests.set(key, (failedRequests.get(key) || 0) + 1);

    if (process.env.NODE_ENV !== 'production') {
      console.error(`Validation errors for ${key}:`, formattedErrors);
    }

    // ✅ Adjust response for frontend clients
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

/**
 * 🔍 Potential Issues & Optimizations
1️⃣ No Handling for Different Validation Severity Levels

Issue: All validation errors are treated the same, even minor warnings.
✅ Fix: Separate critical and optional validation failures:
const criticalErrors = formattedErrors.filter(err => err.critical);
if (criticalErrors.length > 0) {
    return res.status(422).json({
        status: 'error',
        message: 'Critical validation errors detected',
        details: criticalErrors,
    });
}
2️⃣ No Option for Internationalization (i18n) of Error Messages

Issue: Error messages are static and do not support multiple languages.
✅ Fix: Use an i18n library like i18next to translate messages:
message: i18next.t(err.msg);
3️⃣ No Tracking of Frequent Validation Failures

Issue: If a specific user frequently submits invalid data, it should be logged.
✅ Fix: Implement a simple tracking system:
const failedRequests = new Map();
const key = req.ip || req.user?.id;
failedRequests.set(key, (failedRequests.get(key) || 0) + 1);
4️⃣ No Differentiation Between Frontend and API Clients

Issue: Frontend apps may require different validation responses than API clients.
✅ Fix: Use headers to adjust response format:
if (req.headers["accept"] === "text/html") {
    return res.status(400).send("Validation failed. Please check your inputs.");
}
 */