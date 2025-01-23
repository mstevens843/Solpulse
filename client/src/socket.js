import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_WEBSOCKET_URL || "http://localhost:5000", {
  withCredentials: true, // Enable credentials for cookies/auth
  transports: ["websocket", "polling"], // Allow WebSocket and fallback to polling
});

socket.on("connect", () => {
  console.log("WebSocket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("WebSocket disconnected");
});

socket.on("new_message", (data) => {
  console.log("New message received:", data);
});

export default socket;
