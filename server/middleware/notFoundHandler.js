const path = require('path');

const notFoundHandler = (req, res, next) => {
  // Enhanced logging with additional context
  console.warn(`[${new Date().toISOString()}] 404 - Resource not found: ${req.method} ${req.url} - IP: ${req.ip}`);

  if (req.accepts('json')) {
    return res.status(404).json({ msg: 'Resource not found' });
  }

  if (req.accepts('html')) {
    try {
      return res.status(404).sendFile(
        path.resolve(__dirname, '../client/src/pages/NotFound.js'),
        (err) => {
          if (err) {
            console.error('Error sending file:', err.message);
            res.status(500).send('Internal Server Error');
          }
        }
      );
    } catch (err) {
      console.error('Unexpected error in notFoundHandler:', err.message);
      return res.status(500).send('Internal Server Error');
    }
  }

  // Default to plain text response for other content types
  res.status(404).type('txt').send('404 Not Found');
};

module.exports = notFoundHandler;




// Yes, it's totally fine to have both a 404 handler middleware and a 404 page. However, they serve slightly different purposes.

// 404 Middleware (notFoundHandler):

// The middleware is responsible for handling any requests that don't match an existing route.
// It provides a generic response with a status code of 404 and a message like { msg: 'Resource not found' }.
// This is particularly useful when you want to return a simple JSON response for API routes.
// 404 Page (for a web-based application):

// If you're building a web application that serves HTML pages, having a custom 404 page is more user-friendly.
// It provides a more polished experience with an actual page (HTML) informing the user that the page they requested does not exist.
// How to Use Both Together:
// You can use both of them in your application depending on the request type (API vs. Web).

// For example, you can serve a JSON 404 error for API requests and a custom HTML 404 page for non-API routes (e.g., browser requests for a webpage).

// Explanation:
// For API requests: If the request is for an API route, it will return a JSON response with 404 and a msg of 'Resource not found'.
// For web requests: If the request is for a webpage, it will serve the custom NotFound.js page from your client/src/pages/ folder.
// path.join(): Ensures the file is served correctly based on your file structure.
// With this setup, your API responses will return JSON for 404 errors, and your web app will render the NotFound.js page for non-existent routes.

// Explanation of Improvements:
// Logging: We log the request method and URL for every 404, which will help in tracking missing pages or resources.
// Dynamic Path Resolution: path.resolve() is used to ensure the path is resolved dynamically, which ensures that the NotFound.js page is served correctly.
// Handle API and Web Requests: Differentiates between API requests (returns JSON) and regular web page requests (serves the NotFound page).

// Improved notFoundHandler
// To improve the notFoundHandler middleware, we can:

// Ensure that the path to NotFound.js is resolved dynamically based on the server's root directory and correctly serve the NotFound.js file.
// Handle rendering the 404 page more appropriately by rendering it as part of the Express app, if needed.
// Add logging to track requests for non-existent resources for better debugging.