// MediaUpload component provides a simple and reusable interface for uploading media files (image, videos, etc.) in an app. 
// Includes:
// File Selection: Allows users to select a file from their device using a file input. 
// File Upload: 
//      - Simulates file upload functionality (sending the file to a backend API)
//      - Uses FormData to package the file for upload, making it compatible with typical server requirements.
// RESET FUNCTIONALITY: Clears the selected file after the upload is completed. 
// CALLBACK HANDLING: 
//  - Invokes the onMediaUpload callback to notify the parent component about the uploaded file. 

// This component simplifies media handling and can be reused wherever media uploads are needed. 


import React, { useState } from "react";
import PropTypes from "prop-types";
import { api } from "@/api/apiConfig"; // Centralized API instance
import "@/css/components/MediaUpload.css"; // Updated alias for CSS import

function MediaUpload({
    onMediaUpload,
    maxFileSize = 5 * 1024 * 1024, // Default 5MB max file size
    allowedTypes = ["image/jpeg", "image/png", "video/mp4"], // Default allowed types
}) {
    const [media, setMedia] = useState(null);
    const [content, setContent] = useState(""); // Optional content for the post
    const [cryptoTag, setCryptoTag] = useState(""); // Optional crypto tag
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!allowedTypes.includes(file.type)) {
            setError("Unsupported file type. Allowed types are JPEG, PNG, or MP4.");
            return;
        }

        if (file.size > maxFileSize) {
            setError(`File size exceeds the limit of ${(maxFileSize / (1024 * 1024)).toFixed(2)}MB.`);
            return;
        }

        setMedia(file);
        setError("");
    };

    const handleUpload = async () => {
        if (!media) {
            setError("Please select a file to upload.");
            return;
        }

        try {
            setUploading(true);
            setError("");

            const formData = new FormData();
            formData.append("media", media);
            formData.append("content", content);
            formData.append("cryptoTag", cryptoTag);

            // Use the centralized `api` instance for the API call
            const response = await api.post(`/api/posts`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            onMediaUpload(response.data.post);
            setMedia(null);
            setContent("");
            setCryptoTag("");
        } catch (err) {
            console.error("Error uploading file:", err);
            setError(
                err.response?.data?.message || "Failed to upload the file. Please try again."
            );
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="media-upload">
            <label htmlFor="file-upload" className="media-upload-label">
                Upload a file:
            </label>
            <input
                type="file"
                id="file-upload"
                onChange={handleMediaChange}
                aria-label="Upload media file"
                className="media-upload-input"
            />

            {/* <div>
                <label htmlFor="content" className="media-upload-content-label">
                    Post Content (optional):
                </label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Add a caption or description..."
                    rows="2"
                    className="media-upload-textarea"
                />
            </div> */}

            {/* <div>
                <label htmlFor="cryptoTag" className="media-upload-crypto-label">
                    Crypto Tag (optional):
                </label>
                <input
                    type="text"
                    id="cryptoTag"
                    value={cryptoTag}
                    onChange={(e) => setCryptoTag(e.target.value)}
                    placeholder="Tag a crypto asset (e.g., SOL, BTC)"
                    className="media-upload-crypto-input"
                />
            </div> */}

            {error && <p className="media-upload-error" role="alert">{error}</p>}

            {media && (
                <div>
                    <p className="selected-file">Selected file: {media.name}</p>
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="upload-button"
                        aria-label="Upload selected file"
                    >
                        {uploading ? "Uploading..." : "Upload"}
                    </button>
                </div>
            )}
        </div>
    );
}

MediaUpload.propTypes = {
    onMediaUpload: PropTypes.func.isRequired,
    maxFileSize: PropTypes.number,
    allowedTypes: PropTypes.arrayOf(PropTypes.string),
};

export default MediaUpload;






// PAGES WHERE MediaUpload Component is Implemented: 
// POST CREATION PAGE: 
// why: In post creation, users may want to attach files to their posts

// PROFILE PAGE: 
// why: If profile customization includes uploading profile pics or cover photos. 

// DASHBOARD PAGE (OPTIONAL): 
// why: Users may upload directly fro the dashboard, such as updating profile media or uploading files relaed to posts. 



// POTETNTIAL FOR REUSE 
// MESSAGING: to allow users to share files or media in convos. 



// Imrovements Made: 
// Validation: Validate uploaded file type and sie before proceeding
// Error Handling
// Progress Indicator: show upload progress to improve user experience
// Accessibility Enhancements: provide clearer UI for file upload process
// API Integration: Include placeholder for an actual endpoint and handle responses. 


// Additional Considerations
// Drag-and-Drop Support:
// Enhance the component to allow drag-and-drop file uploads.
// Styling:
// Add CSS for a visually appealing upload area.
// API Error Handling:
// Improve API error handling by parsing error responses from the backend.


// 6. MediaUpload
// Reason:

// Multiple controlled inputs and file uploads can be resource-intensive.
// Updates Needed:

// Debounce file input validation.
// Use React.memo to prevent re-renders when allowed types or max file size remain static.
// Isolate large file handling logic outside the component for better readability.

// 7. MessagePreview.js
// Changes Made:
// Memory Leak Fix:

// Improved useEffect cleanup logic with isMounted to ensure state updates do not occur after unmounting.
// React.memo for Message Items:

// Memoized individual message items to prevent unnecessary re-renders.
// Loading and Error State Isolation:

// Separated error state from loading state for better UI responsiveness.

// Key Updates
// MediaUpload Component
// Removed Inline Styles:

// Moved all inline styles to the CSS file.
// Error Handling:

// Refined error messaging for better clarity.
// ARIA Accessibility:

// Added aria-label to interactive elements for screen reader support.

// Improvements:
// Consistent Use of process.env:

// All API calls now use process.env.REACT_APP_API_URL.
// Better Error Handling:

// Error messages display server responses (if available) or a generic error message.
// Improved Accessibility:

// Ensured all labels and inputs have proper aria-labels or associated label elements for screen readers.
// File Size and Type Validation:

// Added explicit checks for file type and size with clear error messages.
// User Feedback During Upload:

// Uploading... feedback and disabled button state while the file is being uploaded.
// Cleaner Reset After Successful Upload:

// Clears media, content, and tag fields upon successful upload.