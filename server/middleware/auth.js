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