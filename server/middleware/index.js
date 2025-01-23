const errorHandler = require('./errorHandler');
const notFoundHandler = require('./notFoundHandler');
const validationErrorHandler = require('./validationErrorHandler');
const auth = require('./auth'); // Re-export auth middleware
const checkOwnership = require('./checkOwnership'); // Re-export ownership middleware
const logger = require('./logger'); // Re-export logger middleware
const rateLimiter = require('./rateLimiter');
const checkCommentOwnership = require('./checkCommentOwnership')

module.exports = {
  errorHandler,
  notFoundHandler,
  validationErrorHandler,
  auth,
  checkOwnership,
  logger,
  rateLimiter,
  checkCommentOwnership,
};
