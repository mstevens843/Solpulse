import React, { useState } from "react";
import { api } from "@/api/apiConfig";
import MediaUpload from "@/components/Post_components/MediaUpload";
import "@/css/pages/PostCreation.css"; // Updated alias for Vite compatibility

function PostCreation() {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [cryptoTag, setCryptoTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const validateMedia = (file) => {
    const allowedTypes = ["image/jpeg", "image/png", "video/mp4"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Only JPG, PNG, and MP4 files are allowed.");
      return false;
    }

    if (file.size > maxSize) {
      setErrorMessage("File size must not exceed 5MB.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset messages
    setErrorMessage("");
    setSuccessMessage("");

    if (!content.trim()) {
      setErrorMessage("Content cannot be empty.");
      return;
    }

    if (content.length > 280) {
      setErrorMessage("Content cannot exceed 280 characters.");
      return;
    }

    if (media && !validateMedia(media)) {
      return;
    }

    setLoading(true);

    // Prepare form data for API submission
    const formData = new FormData();
    formData.append("content", content);
    if (media) formData.append("media", media);
    if (cryptoTag) formData.append("cryptoTag", cryptoTag);

    try {
      const token = localStorage.getItem("token");
      await api.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      // Reset fields on success
      setContent("");
      setMedia(null);
      setCryptoTag("");
      setSuccessMessage("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      setErrorMessage(
        error.response?.data?.error || "Failed to create the post. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-creation-wrapper">
      <div className="post-creation-container">
        <h2>Create New Post</h2>

        {errorMessage && <p className="error-message" role="alert">{errorMessage}</p>}
        {successMessage && <p className="success-message" role="status">{successMessage}</p>}

        <form onSubmit={handleSubmit} className="post-form">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            maxLength="280"
            className="post-content-textarea"
            required
            aria-label="Post content"
          />
          <MediaUpload
            onMediaSelect={(file) => {
              if (validateMedia(file)) {
                setMedia(file);
              }
            }}
            className="media-upload"
          />
          <input
            type="text"
            value={cryptoTag}
            onChange={(e) => setCryptoTag(e.target.value)}
            placeholder="Add a crypto tag (e.g., SOL)"
            className="crypto-tag-input"
            aria-label="Crypto tag"
          />

          {media && (
            <div className="media-preview">
              <img src={URL.createObjectURL(media)} alt="Selected media" className="preview-image" />
            </div>
          )}

          <button type="submit" disabled={loading} className="submit-button" aria-busy={loading}>
            {loading ? "Posting..." : "Post"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PostCreation;