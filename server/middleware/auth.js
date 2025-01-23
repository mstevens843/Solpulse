const { validateToken } = require("../utils/token"); // Import validateToken helper

const authMiddleware = (req, res, next) => {
    try {
        // Extract token from Authorization or x-auth-token headers
        const authHeader = req.headers.authorization;
        const xAuthToken = req.headers["x-auth-token"];
        let token;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1]; // Extract token from Authorization header
        } else if (xAuthToken) {
            token = xAuthToken; // Use x-auth-token header if available
        }

        if (!token) {
            console.error("JWT Error: Authorization token missing");
            return res.status(401).json({ error: "Authorization token missing" });
        }

        // Validate the token using validateToken helper
        const decoded = validateToken({ headers: { authorization: `Bearer ${token}` } });

        // Attach decoded user information to the request object
        req.user = {
            id: decoded.id,
            username: decoded.username,
        };

        console.log("Decoded token:", req.user); // Debugging
        next();
    } catch (error) {
        console.error("JWT Error:", error.message);
        const status =
            error.message === "Authorization token missing"
                ? 401
                : 403; // Return appropriate status for missing or invalid tokens
        res.status(status).json({ error: error.message });
    }
};

module.exports = authMiddleware;




// 1. Standardize error responses:
// It's a good practice to provide consistent error messages across your application. You could define a standard error message format to keep the responses uniform.

// 2. Log only necessary information:
// Instead of logging the entire error, which might leak sensitive information, you can log only the error type or message. You could also consider using a logging library 
// (e.g., Winston) for production-level logging.

// 3. Avoid storing sensitive information directly in req.user:
// Depending on your application's needs, consider only attaching necessary user information to req.user. Storing too much information (especially sensitive information) 
// could lead to potential security issues.

// 4. Token validation:
// Make sure the token is coming from a secure source (e.g., HTTPS) to prevent token interception. This is not handled directly in this middleware, but it's important for 
// security.