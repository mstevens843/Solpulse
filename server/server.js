require('dotenv').config();
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
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));