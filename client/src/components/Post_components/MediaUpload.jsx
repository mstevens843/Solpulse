/**
 * MediaUpload Component
 *
 * This component allows users to upload images or videos as part of their posts.
 * - Uses local state (`media`, `uploading`, `error`) to manage file selection and upload status.
 * - Supports image and video formats (JPEG, PNG, MP4).
 * - Calls the API to upload media and triggers `onMediaUpload` callback to update parent state.
 *
 * Features:
 * - Prevents unnecessary uploads (no upload if no file selected).
 * - Uses a file input reference (`fileInputRef`) for better user experience.
 * - Handles errors and provides user-friendly feedback.
 */


import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import { api } from "@/api/apiConfig";
import "@/css/components/Post_components/MediaUpload.css";

const MAX_FILE_SIZE_MB = 10; // ✅ Max size
const VALID_TYPES = ["image/jpeg", "image/png", "video/mp4"]; // ✅ Supported formats

function MediaUpload({ onMediaUpload }) {
    const [media, setMedia] = useState(null);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0); // ✅ Progress state
    const fileInputRef = useRef(null);

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            setError("File too large. Max 10MB allowed.");
            setMedia(null);
            return;
        }

        if (!VALID_TYPES.includes(file.type)) {
            setError("Invalid file type. Only JPG, PNG, or MP4 allowed.");
            setMedia(null);
            return;
        }

        setMedia(file);
        setError("");
    };

    const handleUpload = async () => {
        if (!media) return;

        try {
            setUploading(true);
            setUploadProgress(0);
            setError("");

            const formData = new FormData();
            formData.append("media", media);

            const response = await api.post(`/api/posts`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percent);
                },
            });

            onMediaUpload(response.data.post);
            setMedia(null);
            setUploadProgress(0);
        } catch (err) {
            console.error("Upload failed:", err);
            setError("Upload failed. Please check your connection or file and try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="media-upload">
            <button
                type="button"
                onClick={handleButtonClick}
                className="icon-button"
                aria-label="Upload Media"
            >
                📷
            </button>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleMediaChange}
                style={{ display: "none" }}
                accept={VALID_TYPES.join(",")}
            />

            {media && (
                <div className="upload-actions">
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="upload-button"
                        aria-label="Confirm Upload"
                    >
                        {uploading ? "..." : "⬆️"}
                    </button>

                    {/* ✅ Progress bar */}
                    {uploading && (
                        <div className="upload-progress-bar">
                            <div
                                className="upload-progress-fill"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                            <span className="upload-progress-text">{uploadProgress}%</span>
                        </div>
                    )}
                </div>
            )}

            {error && <p className="error-message">{error}</p>}
        </div>
    );
}

MediaUpload.propTypes = {
    onMediaUpload: PropTypes.func.isRequired,
};

export default MediaUpload;

/**
 * Potential Improvements:
 * 1. **File Validation:**
 *    - Add size restriction (e.g., reject files > 10MB).
 *    - Ensure valid MIME types before allowing upload.
 *
 * 2. **Progress Indicator:**
 *    - Show a progress bar or percentage during upload.
 *    - Display thumbnail preview before upload.
 *
 * 3. **Error Handling:**
 *    - Provide better error messages (e.g., "File too large", "Invalid format").
 *    - Implement retry logic for network failures.
 */