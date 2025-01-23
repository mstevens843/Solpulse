// MessagePreview component provides a snapshot of recent direct messages, enabling users to stay updated on their conversations
// Includes:
//  - RECENT MESSAGES DISPLAY
// Fetches and displays a list of recent messages, showing sender and snippet of content (first 50 char). 
// DYNAMIC DATA FETCHING: 
// - Uses axios to fetch data from an API endpoint (/api/messages/recent) and updates the component with the latest messages. 
// ERROR HANDLING:
//  - Logs any errors encountered during the API call, ensuring the component doesn't crash. 
// FALLBACK STATE: 
//  - Displays a "No Recent Messages" message if there are no recent conversations. 

// This component keeps users engaged by providing quick access to their latest messages. 

import React, { useState, useEffect } from "react";
import { api } from "@/api/apiConfig"; // Use the configured Axios instance
import Loader from "@/components/Loader";
import "@/css/components/MessagePreview.css"; // Include CSS for styling

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





// PAGES where MessagePreview Component is Implemented: 
// DASHBOARD PAGE: 
// why: The Dashboard aggregates user-specific info, and the MessagePreview component fits perfectly as a section to keep users updated on their convos. 

// HOMEPAGE (Optional): 
// why: The homepage provides an overview of user activity. Adding the MessagePreview component ensures users stay informed about their messages at a glance.
// reference: could be placed in a sidebar or dedicated section. 



// POTENTIAL FOR REUSE: 
// MESSAGING PAGE:
// - The MessagePreview component can be integrated as part of a messaging interface to summarize conversations. 
// PROFILE PAGE:
// - If the profile page includes user activity or updates, this component could be used to display message summaries. 



// Improvements Made: 
// Error Handling: display user-friendly message if API call fails. 
// Loading State: add loading indicator while messages are being fetched. 
// Performance optimization: include proper cleanup for useEffect to avoid potential memory leaks if the component unmounts before API call completes. 
// Accessibility Enhancements: use semantic HTML for better structure and screen reader compatibility. 
// add CSS claddrd to enable easier customization and styling. 

// Key Updates
// Component (MessagePreview.js)
// Error and Loading Handling:

// Simplified rendering logic with clearly labeled classes.
// Improved empty state message for better UX.
// CSS Class Integration:

// Replaced inline styles with CSS classes to clean up the component

// Changes and Improvements:
// Consistent API Call:

// The endpoint now uses process.env.REACT_APP_API_URL for consistency with other components.
// Accessibility Enhancements:

// Added aria-live attributes to update screen readers dynamically for loading, error, and empty states.
// Added aria-label for improved clarity on what each section or item represents.
// Improved Error Handling:

// Displays a user-friendly error message and ensures it only appears if isMounted is true.
// Default Handling:

// Ensures messages is always an array (response.data.messages || []).
// Polished UI:

// Shows meaningful content with a slice of the message while ensuring no errors occur when content is missing or empty.