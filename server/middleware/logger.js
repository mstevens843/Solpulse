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



/**
 * 🔍 Potential Issues & Optimizations
1️⃣ No Log Persistence (Logs Disappear After Restart)

Issue: Logs are only printed to the console and don’t persist for later debugging.
✅ Fix: Store logs in a file using Winston or Morgan:
const fs = require("fs");
const logStream = fs.createWriteStream("logs/access.log", { flags: "a" });
logStream.write(`[${currentDateTime}] ${method} ${url} - IP: ${ip}\n`);


2️⃣ No Differentiation Between Request Types (Info vs. Errors)
Issue: All logs are treated the same, making it hard to filter important logs.
✅ Fix: Color-code logs in development mode for easier readability:
const chalk = require("chalk");
console.log(chalk.green(`[${currentDateTime}] ${method} ${url} - IP: ${ip}`));


3️⃣ No Response Time Logging
Issue: It doesn’t measure how long each request takes, which is useful for performance monitoring.
✅ Fix: Capture and log response times:
const start = Date.now();
res.on("finish", () => {
  const duration = Date.now() - start;
  console.log(`[${currentDateTime}] ${method} ${url} - IP: ${ip} - ${duration}ms`);
});


4️⃣ No Rate-Limiting for Logs (Prevents Log Flooding)
Issue: High-traffic endpoints could flood logs, making debugging harder.
✅ Fix: Use a rate limiter to log only important requests:
let logCount = 0;
setInterval(() => { logCount = 0; }, 60000); // Reset every minute
if (logCount < 50) {
  console.log(`[${currentDateTime}] ${method} ${url} - IP: ${ip}`);
  logCount++;
}

✅ Upgrades Included:
Color-coded logs by status (2xx, 4xx, 5xx)

Includes username or Guest (if req.user exists)

Writes logs to access.log

Adds centralized error logging to error.log

Respects rate limiting for console logs (50/min)


 */