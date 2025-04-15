/**
 * WebSocket Utility for Solpulse
 * 
 * - Manages WebSocket Initialization and event 
 * - Ensures proper setup for real-time communication. 
 * - Provides functions to emit events and handle connections. 
 */

let io; // WebSocket instance

/**
 * Set the WebSocket instance (called from server.js).
 * 
 * - Ensures only one instance of the WebSocket server is created. 
 * - Initializes WebSocket connection and sets up error handling.
 * 
 * @param {Object} socketInstance - The WebSocket server instance. 
 */
const setSocket = (socketInstance) => {
  if (io) {
    //  Prevent unintended reinitialization
    throw new Error("WebSocket server is already initialized.");
  } else {
    io = socketInstance;
    console.log("WebSocket server initialized.");
    setupConnectionHandlers(); // Setup connection and error handling when WebSocket is initialized
  }
};

/**
 * Emit an event to all connected WebSocket clients. 
 * 
 * - Validates the event name before emitting. 
 * - Ensures the WebSocket instance is initialized. 
 * - Validates the payload format before broadcasting. 
 * 
 * @param {string} event - The event name (e.g., 'new-comment', 'update-comment', 'delete-comment').
 * @param {Object} payload - The data to emit with the event.
 */
const handleCommentEvent = (event, payload) => {
  if (!io) {
    console.error("WebSocket instance is not initialized.");
    return;
  }
  if (typeof event !== "string" || !event.trim()) {
    console.error("Invalid event name.");
    return;
  }
  if (!payload || typeof payload !== "object") {
    console.error("Invalid payload format."); //  Extra validation
    return;
  }

  io.to("comment-room").emit(event, payload); //  Namespace support
  console.log(`Event '${event}' broadcasted with payload:`, payload);
};

/**
 * Setup connection and error handling for WebSocket clients.
 * 
 * - Listens for new client connections. 
 * - Handles WebSocket errors on a per-client basis. 
 * - Cleans up when a client disconnects. 
 * - Implements ping/pong heartbeat to detect inactive clients. 
 */
const setupConnectionHandlers = () => {
  if (!io) {
    console.error("WebSocket server is not initialized.");
    return;
  }

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    //  Join room for scoped broadcasting
    socket.join("comment-room");

    // Handle WebSocket errors for individual clients
    socket.on("error", (error) => {
      console.error(`WebSocket error on socket ${socket.id}:`, error);
    });

    // Handle client disconnections
    socket.on("disconnect", (reason) => {
      console.log(`Client ${socket.id} disconnected. Reason: ${reason}`);
    });

    //  Ping/pong heartbeat to detect stale connections
    socket.on("ping", () => {
      socket.emit("pong");
    });
  });

  console.log("WebSocket connection and error handling set up.");
};

module.exports = {
  setSocket,
  handleCommentEvent,
};