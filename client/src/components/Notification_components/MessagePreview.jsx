import React, { useState, useEffect } from "react";
import { api } from "@/api/apiConfig";
import Loader from "@/components/Loader";
import "@/css/components/Notification_components/MessagePreview.css";
function MessagePreview() {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

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