/**
 * Authentication Middleware for SolPulse API 
 * 
 * - Extracts and validates JWT token from request headers
 * - Attaches decoded user data to `req.user` for route access control. 
 * - Handles both "Authorization" and "x-auth-token" headers for flexibility.
 */

const { validateToken } = require("../utils/token"); // Import validateToken helper


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

    // Validate and decode token directly with req
    const decoded = validateToken(req);

    // Attach full decoded payload to req.user
    req.user = decoded;

    console.log("Decoded token:", req.user);
    next();
  } catch (error) {
    console.error("JWT Error:", error.message);

    // Handle specific error types with appropriate status
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


// Optional auth — no error if token missing
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const xAuthToken = req.headers["x-auth-token"];
    let token;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (xAuthToken) {
      token = xAuthToken;
    }

    if (token) {
      try {
        const decoded = validateToken(req);
        req.user = decoded;
        console.log("Optional Auth: user decoded", req.user);
      } catch (err) {
        console.warn("Optional Auth: invalid token");
        // silent fail, don’t attach user
      }
    }

    next();
  } catch (error) {
    console.error("Optional auth error:", error);
    next(); // never block request
  }
};

// Attach optional version to default export
authMiddleware.optional = optionalAuthMiddleware;


module.exports = authMiddleware;