require("dotenv").config();
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
} = require("./middleware");

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST", 'PATCH', "PUT", "DELETE"],
        credentials: true,
    })
);

app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// General API rate limit
app.use(
    "/api/",
    rateLimiter({
        limit: 200,
        windowMs: 15 * 60 * 1000,
    })
);

app.options("*", cors());  // Handle all OPTIONS requests

app.use("/api", apiRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get("/", (req, res) => {
    res.send("Welcome to the SolPulse API!");
});

app.get("/favicon.ico", (req, res) => {
    res.sendStatus(204);
});

// Error handlers
app.use(validationErrorHandler);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;




// Modularity: The Express app (app.js) is separated from the server logic (server.js), making each file smaller and easier to manage.
// Testability: With this structure, you can easily test the app independently from the server.
// Scalability: This pattern is better suited for larger applications as more features are added.

// Common Places to Check
// Tests: If you have integration tests, they might be importing the server instance like this:

// javascript
// Copy code
// const server = require('../server');
// After refactoring, you would change it to import the app from app.js:

// javascript
// Copy code
// const app = require('../app');
// const request = require('supertest');
// const server = request(app); // Use the app instance for testing
// Custom Scripts: If you have custom scripts for seeding or utilities, check for direct imports of server.js.

// Docker/Deployment:

// If you use Docker or any deployment script referencing server.js, ensure they still point to server.js, as it will still be your entry point.


// Common Places to Check
// Tests: If you have integration tests, they might be importing the server instance like this:

// javascript
// Copy code
// const server = require('../server');
// After refactoring, you would change it to import the app from app.js:

// javascript
// Copy code
// const app = require('../app');
// const request = require('supertest');
// const server = request(app); // Use the app instance for testing
// Custom Scripts: If you have custom scripts for seeding or utilities, check for direct imports of server.js.

// Docker/Deployment:

// If you use Docker or any deployment script referencing server.js, ensure they still point to server.js, as it will still be your entry point.
// ex:
// const app = require('../app');
// const request = require('supertest');
// const server = request(app);
// This will test the Express app without starting the server.


// Deployment/Containerization:

// Ensure your Docker or deployment setup still points to server.js as the main entry point.
// Update the start script in your package.json if necessary:

// "scripts": {
//   "start": "node server.js"
// }

// Environment Variables:

// Confirm that dotenv is being properly configured in both app.js and server.js. Only one file needs the require('dotenv').config() call; typically, it's in server.js.

// WebSocket Integration:

// Test your WebSocket connection. Verify that the commentRoutes or other WebSocket-dependent routes are working as expected.

// Benefits You Should Notice
// Easier Testing: Testing the app.js separately from the server logic becomes much simpler.
// Clean Code: Your server.js now focuses solely on starting the server and handling WebSocket logic.
// Scalability: This separation makes adding new features (like middleware or additional services) easier in the future.


// Improvements Made:
// Rate Limiting: Added a custom error message for the rate limiter so the response is clearer.
// Code Organization: The middleware and routes are organized properly, and the use of the validationErrorHandler middleware is maintained for consistency.
// Error Handling Order: The error handlers are placed after the routes to catch errors that occur in the routes or other middlewares.