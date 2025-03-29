/**
 * Authentication Middleware for SolPulse API 
 * 
 * - Extracts and validates JWT token from request headers
 * - Attaches decoded user data to `req.user` for route access control. 
 * - Handles both "Authorization" and "x-auth-token" headers for flexibility.
 */

const { validateToken } = require("../utils/token"); // Import validateToken helper



/**
 * Middleware to authenticate requests. 
 * 
 * - Checks if a valid JWT token is present in headers. 
 * - Decodes and attaches user info (`id`, `username`) to the request. 
 * - Returns 401 (Unauthorized) if the token is missing. 
 * - Returns 403 (Forbidden) if the token is invalid. 
 */


const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const xAuthToken = req.headers["x-auth-token"];
    let token;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
      console.log("Using token from: Authorization Header");
    } else if (xAuthToken) {
      token = xAuthToken;
      console.log("Using token from: x-auth-token Header");
    }

    if (!token) {
      throw new Error("Authorization token missing");
    }

    // ✅ Validate and decode token directly with req
    const decoded = validateToken(req);

    // ✅ Attach full decoded payload to req.user
    req.user = decoded;

    console.log("Decoded token:", req.user);
    next();
  } catch (error) {
    console.error("JWT Error:", error.message);

    // ✅ Handle specific error types with appropriate status
    let status;
    switch (error.message) {
      case "Authorization token missing":
        status = 401;
        break;
      case "Token has expired":
        status = 401;
        error.message = "Session expired. Please log in again.";
        break;
      case "Invalid authentication token.":
        status = 403;
        break;
      default:
        status = 500;
    }

    res.status(status).json({ error: error.message });
  }
};

module.exports = authMiddleware;

/**

🔍 Potential Issues & Optimizations 
1️⃣ Redundant validateToken Call with req.headers Wrapping

Issue: validateToken() is designed to accept req, but you're manually wrapping headers before passing it.
✅ Fix: Pass req directly instead of wrapping it:
const decoded = validateToken(req);


2️⃣ Limited Decoded Data Attached to req.user
Issue: Only id and username are attached, but additional data (e.g., roles, permissions) might be useful.
✅ Fix: Include decoded entirely to give more flexibility in protected routes:
req.user = decoded; // Attaches all decoded JWT payload data


3️⃣ No Handling for Expired Tokens
Issue: If the token is expired, the middleware returns 403 but doesn’t explicitly mention expiration.
✅ Fix: Detect expiration and send a more specific response:
if (error.message === "Token has expired") {
    return res.status(401).json({ error: "Session expired. Please log in again." });
}



4️⃣ No Logging for Source of Token (Auth Header vs. X-Auth-Token)
Issue: If authentication fails, debugging which header was used could help.
✅ Fix: Add a log to track which header was utilized:
console.log(`Using token from: ${authHeader ? "Authorization Header" : "x-auth-token Header"}`);



5️⃣ Hardcoded Status Codes (401 and 403)
Issue: This doesn’t handle all possible JWT errors (e.g., malformed tokens).
✅ Fix: Use a switch case to differentiate between multiple errors:
let status;
switch (error.message) {
    case "Authorization token missing":
        status = 401;
        break;
    case "Token has expired":
        status = 401;
        break;
    case "Invalid authentication token.":
        status = 403;
        break;
    default:
        status = 500;
}
res.status(status).json({ error: error.message });

 */