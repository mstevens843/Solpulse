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


/**
 * 🔍 Potential Issues & Optimizations
1️⃣ Incorrect File Reference for NotFound.js

Issue: The middleware tries to serve NotFound.js, but React components are not server-rendered.
✅ Fix: Serve the actual built HTML file instead:
return res.status(404).sendFile(path.resolve(__dirname, '../client/build/404.html'));
🛠 Alternative Fix: If using React Router for 404 handling, redirect instead:
return res.redirect('/not-found');


2️⃣ Logging Can Be Overwhelming on High-Traffic APIs
Issue: Every 404 request logs a warning, which can flood logs in production.
✅ Fix: Log only unique missing routes (store recent logs in memory and limit duplicates):
const missingRoutes = new Set();
if (!missingRoutes.has(req.url)) {
    missingRoutes.add(req.url);
    console.warn(`[${new Date().toISOString()}] 404 - Resource not found: ${req.method} ${req.url} - IP: ${req.ip}`);
}


3️⃣ No Handling for API Route Prefixes

Issue: Some 404s might be frontend routes rather than API requests, causing unintended API responses.
✅ Fix: If a request starts with /api, always return a JSON response:
if (req.url.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
}


4️⃣ Lack of Multi-Language Support for Error Messages

Issue: If internationalization (i18n) is planned, the error messages should be configurable.
✅ Fix: Use a localization module (e.g., i18next) to provide language-based responses.
 */