let io; // WebSocket instance

/**
 * Set the WebSocket instance (called from server.js).
 * @param {Object} socketInstance - The WebSocket server instance.
 */
const setSocket = (socketInstance) => {
  if (io) {
    console.warn("WebSocket server is already initialized.");
  } else {
    io = socketInstance;
    console.log("WebSocket server initialized.");
    setupConnectionHandlers(); // Setup connection and error handling when WebSocket is initialized
  }
};

/**
 * Ensure the WebSocket server is initialized and emit the event.
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
  io.emit(event, payload);
  console.log(`Event '${event}' broadcasted with payload:`, payload);
};

/**
 * Setup connection and error handling for WebSocket clients.
 */
const setupConnectionHandlers = () => {
  if (!io) {
    console.error("WebSocket server is not initialized.");
    return;
  }

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Handle WebSocket errors for individual clients
    socket.on("error", (error) => {
      console.error(`WebSocket error on socket ${socket.id}:`, error);
    });

    // Handle client disconnections
    socket.on("disconnect", (reason) => {
      console.log(`Client ${socket.id} disconnected. Reason: ${reason}`);
    });
  });

  console.log("WebSocket connection and error handling set up.");
};

module.exports = {
  setSocket,
  handleCommentEvent,
};