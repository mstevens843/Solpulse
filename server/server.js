/** 
 * Server Setup for SolPulse Backend
 * 
 * This file initializes the HTTP and WebSocket servers, connects to the database. 
 * and manages graceful shutdowns. It ensures that WebSockets are configured properly. 
 * and that the database connection is validated before starting the server. 
 */


require('dotenv').config();
console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode`);
console.log(`🛢️ Using DB host: ${process.env.DB_HOST}`);


const http = require('http');
const { Server } = require('socket.io');
const sequelize = require('./models/Index'); // Sequelize connection
const app = require('./app'); // Express app configuration
const commentRoutes = require('./api/comments'); // Comment routes for WebSocket setup
const { setSocket } = require('./api/comments');
const { allowedOrigins } = require('./config/config'); // Centralized allowed origins from config.js

// Create HTTP server using Express app
const server = http.createServer(app);

/**
 * Websocket Setup 
 * - Uses `socket.io` for real-time communication
 * - CORS configuration allows connections only from specified origins
 * - Supports both WebSocket and polling transports
 */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // ✅ Centralized configuration from config.js
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Allowed methods
    credentials: true, // Allow credentials for WebSocket connections
  },
  transports: ['websocket', 'polling'], // Enable WebSocket and polling transports
});

// Initialize WebSocket
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // ✅ Enhancement: Add error and reconnect listeners
  socket.on('error', (err) => {
    console.error(`WebSocket error for client ${socket.id}:`, err);
  });

  socket.on('reconnect_attempt', () => {
    console.log(`Client ${socket.id} attempting to reconnect...`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Pass WebSocket instance to comment handling logic. 
setSocket(io);

/** 
 * Database Connection Test
 * 
 * - Ensures that the database connection is established before proceeding.
 * - If the connection fails, the server exits to prevent undefined behavior.
 */
sequelize.sequelize
  .authenticate()
  .then(() => console.log('Database connection is successful'))
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
    process.exit(1); // Exit immediately to precenbt running without a database. 
  });

/**
 * Graceful Shutdown Handling
 *  
 *  - Ensures the database connection and Websocket server close properly on exit signals. 
 * - Prevents potential memory leaks or stale connections. 
 */
const shutdown = async () => {
  try {
    // Close database connection
    await sequelize.sequelize.close();
    console.log(`[${new Date().toISOString()}] Database connection closed gracefully`);

    // close HTTP server
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    console.log(`[${new Date().toISOString()}] HTTP server closed`);

    // Close Websocket Server
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

// Handle termination signals (Ctrl + c or server shutdown); 
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown); // Handle termination signals

// ✅ Ensure graceful shutdown on uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  shutdown();
});

// Start the server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

/**
 *  Potential Issues & Optimizations
Hardcoded Default CORS Origin (localhost:3000)

✅ Fix: Use allowedOrigins from config.js instead of environment variables to centralize CORS rules.
WebSocket Connection Handling

✅ Enhancement: Consider adding event listeners for error and reconnect to improve stability.
Graceful Shutdown on Crashes

✅ Potential Fix: Ensure that shutdown() is also triggered on uncaught exceptions:

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  shutdown();
});
 */
