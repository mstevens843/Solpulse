/**
 * socket.js
 *
 * This file is responsible for managing WebSocket connections using `socket.io-client`.
 * It establishes a connection with the backend WebSocket server and listens for real-time events.
 *
 * **Key Features:**
 * - Automatically connects to the WebSocket server.
 * - Supports authentication via credentials (cookies/tokens).
 * - Listens for new messages and logs received data.
 * - Handles connection and disconnection events.
 */

import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_WEBSOCKET_URL || "http://localhost:5001", {
  withCredentials: true, // Enable credentials for cookies/auth
  transports: ["websocket", "polling"], // Allow WebSocket and fallback to polling
});


// Handle WebSocket connection event
socket.on("connect", () => {
  console.log("WebSocket connected:", socket.id);
});


// Handle WebSocket disconnection event
socket.on("disconnect", () => {
  console.log("WebSocket disconnected");
});


// Listen for new messages
socket.on("new_message", (data) => {
  console.log("New message received:", data);
});

export default socket;


/**
 * 🔹 **Potential Improvements:**
 * 1. **Implement Message Notifications**:
 *    - Dispatch a Redux or context action when a new message is received.
 *    - Show real-time notifications or update the UI accordingly.
 *
 * 2. **Enhance Error Handling**:
 *    - Implement automatic reconnection strategies when the WebSocket disconnects.
 *    - Display UI feedback if the connection is lost.
 *
 * 3. **Expand Event Listeners**:
 *    - Listen for additional events like `user_typing`, `reaction_added`, or `message_deleted`.
 *    - Support real-time updates for likes, comments, and follows.
 *
 * 4. **Optimize Performance**:
 *    - Use a throttling mechanism for frequent events to avoid unnecessary UI updates.
 *    - Implement WebSocket compression to reduce bandwidth usage.
 */