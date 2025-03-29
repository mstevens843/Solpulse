/**
 * MessagePreview.js
 *
 * This file is responsible for fetching and displaying a preview of recent messages.
 * It allows users to:
 * - Retrieve the most recent messages from the backend.
 * - Display a truncated preview (first 50 characters) of each message.
 * - Handle loading and errors gracefully with user-friendly messages.
 *
 * Features:
 * - Uses `useEffect` to fetch messages when the component mounts.
 * - Implements a cleanup function to prevent memory leaks from state updates on unmounted components.
 * - Supports accessibility with proper `aria-labels` for screen readers.
 */

import React, { useState, useEffect } from "react";
import { api } from "@/api/apiConfig";
import Loader from "@/components/Loader";
import "@/css/components/Notification_components/MessagePreview.css";


function MessagePreview() {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");



    /**
     * Fetches recent messages when the component mounts.
     * - Calls the `/messages/recent` endpoint.
     * - Updates the state with messages or an error message.
     * - Uses a cleanup function to prevent setting state on unmounted components.
     */
    useEffect(() => {
        let isMounted = true;



        const fetchRecentMessages = async () => {
            setIsLoading(true);
            try {
                const response = await api.get("/messages/recent");
                if (isMounted) {
                    setMessages(response.data.messages || []);
                    setError("");
                }
            } catch (err) {
                if (isMounted) {
                    setError("Failed to load recent messages. Please try again.");
                }
                console.error("Error fetching recent messages:", err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchRecentMessages();

        // Cleanup function to prevent memory leaks
        return () => {
            isMounted = false; // Cleanup to avoid memory leaks
        };
    }, []);

    return (
        <div className="message-preview-container">
            <h2 className="message-preview-header" aria-label="Recent Messages">
            </h2>
            {isLoading ? (
                <Loader aria-label="Loading recent messages" />
            ) : error ? (
                <p className="message-preview-error" role="alert">
                    {error}
                </p>
            ) : messages.length > 0 ? (
                <ul className="message-preview-list" aria-label="Message previews">
                    {messages.map((msg) => (
                        <li key={msg.id} className="message-preview-item">
                            <strong className="message-preview-sender">{msg.sender}</strong>:{" "}
                            <span className="message-preview-snippet">
                                {msg.content.slice(0, 50)}
                                {msg.content.length > 50 && "..."}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="message-preview-empty" aria-live="polite">
                    No recent messages available.
                </p>
            )}
        </div>
    );
}

export default MessagePreview;


/**
 * 🔹 **Potential Improvements:**
 * 1. **WebSocket Integration**:
 *    - Implement WebSockets to update messages in real-time instead of relying on `useEffect`.
 *
 * 2. **UI Enhancements**:
 *    - Add timestamps to each message preview to show when they were received.
 *    - Show an avatar or user profile picture for better visualization.
 *
 * 3. **Load More Messages**:
 *    - Introduce pagination or an infinite scroll feature to load older messages.
 *
 * 4. **Error Handling**:
 *    - Display a retry button if messages fail to load.
 *    - Provide detailed error feedback instead of a generic message.
 */
