import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import { api } from "@/api/apiConfig";
import "@/css/components/Post_components/MediaUpload.css";

function MediaUpload({ onMediaUpload }) {
    const [media, setMedia] = useState(null);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMedia(file);
            setError("");
        }
    };

    const handleUpload = async () => {
        if (!media) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("media", media);

            const response = await api.post(`/api/posts`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            onMediaUpload(response.data.post);
            setMedia(null);
        } catch (err) {
            console.error("Upload failed:", err);
            setError("Upload failed. Try again.");
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
                accept="image/jpeg, image/png, video/mp4"
            />

            {media && (
                <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="upload-button"
                    aria-label="Confirm Upload"
                >
                    {uploading ? "..." : "⬆️"} {/* Upload Icon */}
                </button>
            )}

            {error && <p className="error-message">{error}</p>}
        </div>
    );
}

MediaUpload.propTypes = {
    onMediaUpload: PropTypes.func.isRequired,
};

export default MediaUpload;