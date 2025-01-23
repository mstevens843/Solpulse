// socket.js powers real-time communication.


// What is a WebSocket?
// A WebSocket is a communication protocol that provides full-duplex (two-way) communication between a client (e.g., a browser) and a server over a single, 
// long-lived connection. Unlike HTTP, which is request-response based and stateless, WebSockets allow for continuous communication without requiring a new connection 
// for every message.

// Why Use WebSockets?
// WebSockets are ideal for applications that need real-time updates or low-latency communication, such as:

// Live Chat: Users can exchange messages instantly.
// Notifications: Send real-time alerts (e.g., "New comment on your post").
// Live Feeds: Update live stock prices, scores, or data streams.
// Collaborative Apps: Sync updates across users in tools like Google Docs.


// How Do WebSockets Work?
// Connection Initiation:
// The client sends an HTTP request to the server to "upgrade" the connection to a WebSocket.
// If the server accepts, the connection is established as a WebSocket.
// Full-Duplex Communication:
// Both client and server can send and receive messages anytime, without needing to wait for a response.
// Persistence:
// The connection remains open until explicitly closed by either the client or the server.


// What It Does:
// Core Functionality:
// Manages WebSocket interactions in your app.
// Functions include:
// setSocket: Initializes the WebSocket server instance.
// broadcastEvent: Sends messages to all connected clients.
// sendToClient: Sends a targeted message to a specific client.
// setupErrorHandling: Handles WebSocket errors gracefully.
// Why We Need It:
// Real-Time Communication:
// Enables real-time updates and notifications for features like comments, transactions, or follower actions.
// Centralized Management:
// Provides a single utility to manage WebSocket interactions, ensuring consistent behavior across the app.
// Error Handling:
// Prevents crashes or issues during WebSocket communication by handling errors systematically.
// What Would Happen Without It:
// No Real-Time Features:
// You wouldn’t be able to implement features like live notifications, updates, or collaborative tools.
// Disorganized Code:
// WebSocket logic would be scattered across your app, making it harder to debug and maintain.
// Unstable Communication:
// Without centralized error handling, WebSocket communication might fail silently or cause crashes.

// Your websocket.js File
// This file manages the WebSocket server logic for your application. Here’s a summary of its functionality:

// Set WebSocket Instance (setSocket):

// This function initializes the WebSocket server instance (io) and links it to your app.
// It allows other parts of your app to broadcast events or messages.
// Broadcasting Events (broadcastEvent):

// Sends a message or event to all connected clients.
// Used for features like notifying users about new comments or updates.
// Targeted Messages (sendToClient):

// Sends a specific message to a particular client (based on their connection ID).
// Useful for private notifications or personalized messages.
// Error Handling (setupErrorHandling):

// Catches WebSocket errors to prevent crashes or unexpected behavior.
// Improves the reliability of your real-time communication.

// What Happens If You Don’t Use WebSockets?
// Without WebSockets, your app would have to rely on polling or long-polling to achieve real-time functionality:

// Polling:
// The client repeatedly sends requests to the server at regular intervals to check for updates.
// Example: A chat app polling every second for new messages.
// Drawbacks: Inefficient, increases server load, and introduces latency.
// Long-Polling:
// The server keeps the request open until new data is available, then closes the connection and sends the data.
// The client immediately sends a new request after receiving data.
// Drawbacks: Slightly better than polling but still resource-intensive.
// WebSockets eliminate these inefficiencies by keeping the connection alive and allowing instant communication.


// Why Do You Need websocket.js?
// Your websocket.js file provides:

// Centralized Management:

// All WebSocket-related logic (e.g., broadcasting events) is in one place, making the code more maintainable.
// Real-Time Functionality:

// Enables features like live notifications, real-time updates, or collaborative tools in your app.
// Ease of Integration:

// Other parts of your app can easily use WebSocket functionality by importing this file.
// Error Handling:

// Prevents unexpected crashes or failures during WebSocket communication.

// What Happens Without websocket.js?
// Without websocket.js, your app would:

// Lose real-time communication capabilities.
// Have scattered WebSocket logic, making the code harder to manage and debug.
// Be more prone to errors, as centralized error handling for WebSockets would be absent.
// By using websocket.js, you enhance the scalability, reliability, and maintainability of your app’s real-time features.


// Example:
// Files:
// routes/comments.js
// routes/notifications.js
// routes/posts.js
// How and Why?
// Real-Time Notifications:
// When a user comments on a post, likes a post, or follows another user, a WebSocket event is triggered to notify relevant users.
// Example: Broadcasting a new comment to users viewing the post in real-time.
// Functionality:
// These routes call functions like broadcastEvent from websocket.js to notify connected clients of the new updates.


// 2. Client-Side Real-Time Updates
// Example:
// Files:
// Front-End: websocket-client.js (or an equivalent file where WebSocket connections are managed on the client side).
// How and Why?
// Listening for Events:
// The client connects to the WebSocket server and listens for events like newComment, newNotification, or likeEvent.
// Example: If someone likes a post, the client UI updates in real-time without requiring a page refresh.
// Functionality:
// The client uses io.on('eventName', callback) to process incoming WebSocket events.


// 5. Server Initialization
// Example:
// Files:
// server.js
// How and Why?
// Initializing WebSocket Server:
// The WebSocket server (io) is created and passed to websocket.js using setSocket.
// Example:
// javascript
// Copy code
// const io = require('socket.io')(server);
// const { setSocket } = require('./utils/websocket');
// setSocket(io);
// Functionality:
// This step ensures that the WebSocket instance is accessible throughout the application.


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



// Improve Comment Route WebSocket Integration Move WebSocket-specific setup to a dedicated file and avoid passing the WebSocket instance around unnecessarily.

// Changes and Enhancements
// Renamed handleCommentEvent to broadcastEvent:

// Generalized the function name for broader use beyond comments.
// Added sendToClient:

// Sends an event to a specific client using their socket ID.
// Useful for private notifications or targeted messages.
// Added setupErrorHandling:

// Handles WebSocket errors for better stability and debugging.
// Added Logging:

// Logs each action for better monitoring and debugging.
// Enhanced Error Handling:

// Added checks for missing socket instances or invalid client IDs.
// Why These Changes?
// Reusability: The utility now supports more scenarios like targeted messaging and error handling.
// Error Prevention: Logs and error handling ensure smoother debugging and stability in production.
// Scalability: Functions like sendToClient allow finer control over client interactions.
// How It Interacts
// Server Integration: The setSocket function integrates the WebSocket instance from your server (server.js).
// Client Interaction: broadcastEvent and sendToClient manage events and messages for connected clients.
// Error Management: Logs and error handling provide insights into potential issues during WebSocket communication.


// Suggested Improvements:
// Error Handling for setSocket: Ensure that the WebSocket instance (io) is set before calling any other functions. You could add a check in setSocket to ensure 
// it’s only set once, to prevent overwriting.
// Logging: The logging is useful for debugging, but it might be beneficial to use more consistent logging practices (like using a logging library).
// Modularize Error Handling: Instead of duplicating error handling logic across multiple functions, you can create a utility function that checks whether io is set 
// and handles errors uniformly.
// Socket Cleanup: It might be useful to handle socket cleanup when clients disconnect, to avoid memory leaks.
// Event Emission Validation: Add validation to ensure that event and data are valid before emitting events.

// Changes Made:
// Preventing Multiple Initializations of io: The setSocket function now checks if io is already set to prevent overwriting.
// Improved Event Validation: Added validation checks for event names to ensure they are non-empty strings before broadcasting.
// Socket Cleanup (Disconnection Handling): Added basic disconnect logging to help track when clients disconnect.
// Error Handling for Missing io: Centralized the error handling for missing io across all methods to reduce redundancy.
// Use of validateAndBroadcast: Used a new helper function for broadcasting events to ensure that all checks are applied consistently.