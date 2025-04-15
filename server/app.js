/**
 * Express App configuration for SolPulse API
 * 
 * - Sets up middleware for security, logging, CORS, and rate limiting. 
 * - Defines API routes and serves static files.
 * - Implements Error Handling
 */


// require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimiter = require("./middleware/rateLimiter");

const apiRoutes = require("./api");
const {
    errorHandler,
    notFoundHandler,
    validationErrorHandler,
    logger,
    errorLogger,
} = require("./middleware");
const { allowedOrigins } = require("./config/config"); // Centralized allowed origins

const app = express();

/**
 * CORS Middleware
 * 
 * - Allows Cross-origin requests from specified origins.
 * - Ensures secure handling of credentials. 
 */
app.use(
    cors({
        origin: allowedOrigins, // Use centralized allowed origins config
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
        credentials: true,
    })
);

/**
 * Security Middleware 
 * 
 * - Helmet helps secure the app by setting various HTTP headers. 
 * - `crossOriginResourcePolicy`: false` is set to allow cross-origin sharing.
 */
app.use(
    helmet({
        crossOriginResourcePolicy:
            process.env.NODE_ENV === "production" ? "same-origin" : false, // More secure in production
    })
);

// Added request body size limit to prevent abuse
app.use(express.json({ limit: "1mb" })); 
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));



app.use(logger); // logs to file and console

/**
 * 
 * - Limits API requests to prevent abuse. 
 * - Allows 200 requests per 15 minutes per IP. 
 */
app.use(
    "/api/",
    rateLimiter({
        limit: 200,
        windowMs: 15 * 60 * 1000,
    })
);

// Example of applying stricter rate limit to auth routes (can expand this later)
app.use(
    "/api/auth",
    rateLimiter({
        limit: 50, // Tighter limit for login attempts
        windowMs: 15 * 60 * 1000,
    })
);

/**
 * Preflight Requests Handling
 * 
 * - Allows all OPTIONS requests, ensuring proper CORS handling.
 */
app.options("*", cors()); // Handle all OPTIONS requests

// API Routes: Mounts all API routes under `/api`
app.use("/api", apiRoutes);

/** 
 * Static File Serving 
 * 
 * - Serves uploaderd files from the `uploads` directory.
 * - Uses _dirname for absolute path. 
 */
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 
// Removed duplicate static route

/**
 * Root Route
 * 
 * - Basic welcome message to confirm API is running. 
 */
app.get("/", (req, res) => {
    res.send("Welcome to the SolPulse API!");
});

/**
 * Favicon Request Handling
 * 
 * - Prevents unnecessary logging of favicon requests by returning 204 No Content.
 */
app.get("/favicon.ico", (req, res) => {
    res.sendStatus(204);
});

/**
 * Error Handling Middleware
 * 
 * - Handles validation errors, 404 errors, and general errors. 
 */
app.use(errorLogger); // logs uncaught errors to error.log
app.use(validationErrorHandler);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;