const errorHandler = require('./errorHandler');
const notFoundHandler = require('./notFoundHandler');
const validationErrorHandler = require('./validationErrorHandler');
const auth = require('./auth');
const checkOwnership = require('./checkOwnership');
const { logger, errorLogger } = require('./logger');
const rateLimiter = require('./rateLimiter');
const checkCommentOwnership = require('./checkCommentOwnership')

module.exports = {
  logger,
  errorLogger,
  errorHandler,
  notFoundHandler,
  validationErrorHandler,
  auth,
  checkOwnership,
  rateLimiter,
  checkCommentOwnership,
};
