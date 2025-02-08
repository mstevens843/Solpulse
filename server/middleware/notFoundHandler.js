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