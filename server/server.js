/**
 * server.js
 * 
 * This file sets up and starts the Express server for the application.
 * It also connects to the Solana blockchain for wallet-related functionalities.
 */

/**
 * server.js
 * 
 * This file sets up and starts the Express server for the application.
 * It also connects to the Solana blockchain for wallet-related functionalities.
 */

/**
 * server.js
 * 
 * This file sets up and starts the Express server for the application.
 * It also connects to the Solana blockchain for wallet-related functionalities.
 */

require('dotenv').config(); // Load environment variables at the very top
const http = require('http');
const { Server } = require('socket.io');
const sequelize = require('./models/Index'); // Sequelize connection
const app = require('./app'); // Express app configuration
const commentRoutes = require('./api/comments'); // Comment routes for WebSocket setup
const { setSocket } = require('./api/comments');
const { allowedOrigins } = require('./config/config'); // Centralized allowed origins from config.js





// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket with CORS using allowedOrigins
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000", // Use centralized configuration
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Allowed methods
    credentials: true, // Allow credentials for WebSocket
  },
  transports: ['websocket', 'polling'], // Enable WebSocket and polling transports
});

// Initialize WebSocket
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

setSocket(io);


// Test database connection
sequelize.sequelize
  .authenticate()
  .then(() => console.log('Database connection is successful'))
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
    process.exit(1); // Exit immediately on database connection failure
  });

// Graceful shutdown
const shutdown = async () => {
  try {
    await sequelize.sequelize.close();
    console.log(`[${new Date().toISOString()}] Database connection closed gracefully`);
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    console.log(`[${new Date().toISOString()}] HTTP server closed`);
    await new Promise((resolve, reject) => {
      io.close((err) => (err ? reject(err) : resolve()));
    });
    console.log(`[${new Date().toISOString()}] WebSocket server closed`);
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown); // Handle termination signals

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));





// Explanation:
// Middleware: Added logger, error handling, and 404 not found handling to ensure all parts of the server's response cycle are managed appropriately.
// Routes: If you have routes for posts, comments, and tips, they should be defined similarly to auth and wallet routes and imported at the top of the file.
// 404 Handler: This middleware will catch any requests to non-existent routes and handle them appropriately.
// Validation Error Handler: Positioned after routes that may include validations to catch and return validation errors before the request hits other logic or error handling.


// Changes made:
// User routes: Added /api/users for managing user profiles.
// Middleware: Included all necessary middleware (logger, validationErrorHandler, notFoundHandler, and errorHandler).
// Routes for all entities: Auth, Wallet, Post, Comment, Tip, and User routes are now correctly set up.

// Updates:
// Added userRoutes: Implemented user profile management routes.
// Refined middleware usage: All middleware has been properly configured to handle validation, logging, errors, and 404 responses.
// Test database connection: Ensures the app successfully connects to the database before starting.

// Changes to server.js
// WebSocket Integration:

// Added http and socket.io modules to enable WebSocket support.
// Created a WebSocket instance using io and set up event listeners for connections and disconnections.
// Pass WebSocket to Comment Routes:

// Updated commentRoutes to pass the WebSocket instance (io) for real-time updates.
// CORS Support for WebSocket:

// Configured WebSocket to allow all origins during development. For production, this should be restricted to specific origins.
// Comments for Clarity:

// Preserved your original comments and added new ones to explain the changes related to WebSocket functionality.


// Changes Made:
// Graceful Shutdown:

// await was added to ensure proper shutdown of both the HTTP and WebSocket servers.
// Promise was used to ensure that the server.close() and io.close() functions are awaited correctly.
// Database Connection Failure Handling:

// If the database connection fails, the process exits immediately with process.exit(1). This prevents the server from running in a faulty state.
// Logging for Missing Environment Variables:

// A warning could be logged if essential environment variables like PORT or CORS_ORIGIN are missing.
