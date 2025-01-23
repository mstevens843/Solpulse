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


// Benefits of the Enhanced Logger:
// Timestamp: Provides a clear record of when requests were made.
// IP Address: Logs the client's IP, useful for tracking or security.
// Scalability: Easily extendable to include other details like headers or query parameters.