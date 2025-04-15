/**
 * Request Logging Middleware for SolPulse API
 *
 * - Logs incoming requests for debugging and monitoring.
 * - Captures request method, URL, IP address, and timestamp.
 */

/**
 * Request Logging Middleware for SolPulse API
 *
 * - Logs incoming requests for debugging and monitoring.
 * - Persists logs to file for later analysis.
 * - Tracks response times and rate-limits excessive logging.
 * - Color-codes logs in development for better readability.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const logDirectory = path.join(__dirname, '../logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const accessLogStream = fs.createWriteStream(path.join(logDirectory, 'access.log'), { flags: 'a' });
const errorLogPath = path.join(logDirectory, 'error.log');

let logCount = 0;
setInterval(() => {
  logCount = 0;
}, 60000); // Reset count every minute

const logger = (req, res, next) => {
  const currentDateTime = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.headers['x-forwarded-for'] || 'Unknown IP';
  const user = req.user?.username || 'Guest';
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;

    const baseMessage = `[${currentDateTime}] ${method} ${url} ${status} - User: ${user} - IP: ${ip} - ${duration}ms`;
    let logMessage = baseMessage;

    if (process.env.NODE_ENV !== 'production') {
      if (status >= 500) logMessage = chalk.red(baseMessage);
      else if (status >= 400) logMessage = chalk.yellow(baseMessage);
      else logMessage = chalk.green(baseMessage);

      if (logCount < 50) console.log(logMessage);
    } else {
      if (logCount < 50) console.log(baseMessage);
    }

    accessLogStream.write(baseMessage + '\n');
    logCount++;
  });

  next();
};

// Optional centralized error logger
const errorLogger = (err, req, res, next) => {
  const errorMessage = `[${new Date().toISOString()}] ERROR - ${err.message}\n${err.stack}\n`;
  fs.appendFileSync(errorLogPath, errorMessage);
  next(err);
};

module.exports = {
  logger,
  errorLogger,
};