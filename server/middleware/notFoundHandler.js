/**
 * 404 Not Found Middleware for SolPulse API
 *
 * - Handles requests to non-existent routes.
 * - Logs missing resource details, including method and IP.
 * - Responds with JSON, HTML, or plain text based on the client's request type.
 */

const path = require('path');
const i18next = require('i18next'); // Optional: Add i18n messages if used

// Prevents log flooding by caching recent 404 URLs
const recentMissingRoutes = new Set();
setInterval(() => recentMissingRoutes.clear(), 60000); // Reset every 60 seconds



/**
 * Middleware to Handle 404 Not Found Errors
 *
 * - Logs request details for debugging.
 * - Returns JSON response if the client accepts JSON.
 * - Returns an HTML page if the client accepts HTML.
 * - Defaults to a plain text response if no other content type is accepted.
 */
const notFoundHandler = (req, res, next) => {
  const isApiRequest = req.url.startsWith('/api');
  const ip = req.ip || req.headers['x-forwarded-for'] || 'Unknown IP';
  const timestamp = new Date().toISOString();

  // Log only if this route hasn't already been logged recently
  if (!recentMissingRoutes.has(req.url)) {
    recentMissingRoutes.add(req.url);
    console.warn(`[${timestamp}] 404 - Resource not found: ${req.method} ${req.url} - IP: ${ip}`);
  }

  // API-specific 404 response
  if (isApiRequest || req.accepts('json')) {
    const localizedMessage =
      i18next.exists('errors.notFound') && req.language
        ? i18next.t('errors.notFound', { lng: req.language })
        : 'Resource not found';

    return res.status(404).json({ error: localizedMessage });
  }

  // HTML fallback for frontend React app (SPA)
  if (req.accepts('html')) {
    try {
      return res.status(404).sendFile(
        path.resolve(__dirname, '../client/build/404.html'),
        (err) => {
          if (err) {
            console.error('Error sending 404.html:', err.message);
            res.status(500).send('Internal Server Error');
          }
        }
      );
    } catch (err) {
      console.error('Unexpected error in notFoundHandler:', err.message);
      return res.status(500).send('Internal Server Error');
    }
  }

  // Fallback to plain text
  res.status(404).type('txt').send('404 Not Found');
};

module.exports = notFoundHandler;