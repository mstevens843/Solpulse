// middleware to log details of incoming requests. useful for debugging or montitoring api usage.
const logger = (req, res, next) => {
  const currentDateTime = new Date().toISOString(); // Add a timestamp
  const method = req.method;
  const url = req.url;
  const ip = req.ip; // Log the client's IP address (if applicable)

  console.log(`[${currentDateTime}] ${method} ${url} - IP: ${ip}`);
  next();
};

module.exports = logger;