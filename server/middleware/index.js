const errorHandler = require('./errorHandler');
const notFoundHandler = require('./notFoundHandler');
const validationErrorHandler = require('./validationErrorHandler');
const auth = require('./auth');
const checkOwnership = require('./checkOwnership');
const logger = require('./logger'); 
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
