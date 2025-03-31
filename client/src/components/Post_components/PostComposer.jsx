/**
 * PostComposer Component
 *
 * This component allows users to create posts with:
 * - **Text content** (up to 280 characters).
 * - **Optional media uploads** (images/videos).
 * - **Crypto tags** for categorization.
 * - **Form validation** to ensure correct input.
 * - **Real-time UI updates** after successful post creation.
 *
 * Features:
 * - Uses `react-toastify` for success/error messages.
 * - Validates and restricts media file types and sizes.
 * - Handles expired JWT errors by prompting re-login.
 */


import React, { useState, useRef } from "react";
import { api } from "@/api/apiConfig";
import MediaUpload from "@/components/Post_components/Actions/MediaUpload";
import "@/css/components/Post_components/PostComposer.css";
import { toast, ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function PostComposer({ onPostCreated }) {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [cryptoTag, setCryptoTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const dropRef = useRef(null);

  /** ✅ #1 Improved Error Handling */
  const validateMedia = (file) => {
    const allowedTypes = ["image/jpeg", "image/png", "video/mp4"];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("❌ Invalid file type. Only JPG, PNG, and MP4 allowed.");
      return false;
    }
    if (file.size > maxSize) {
      setErrorMessage("❌ File too large. Max size is 5MB.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!content.trim()) {
      setErrorMessage("❌ Content cannot be empty.");
      return;
    }
    if (content.length > 280) {
      setErrorMessage("❌ Content cannot exceed 280 characters.");
      return;
    }
    if (media && !validateMedia(media)) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("content", content);
    if (media) formData.append("media", media);
    if (cryptoTag) formData.append("cryptoTag", cryptoTag);

    try {
      const token = localStorage.getItem("token");
      const response = await api.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setContent("");
      setMedia(null);
      setCryptoTag("");
      onPostCreated(response.data.post);

      toast.success("✅ Post created!", {
        autoClose: 3000,
        transition: Slide,
        pauseOnHover: false,
        pauseOnFocusLoss: false,
      });
    } catch (error) {
      console.error("Error creating post:", error);
      const serverError = error.response?.data?.error;

      if (serverError?.toLowerCase().includes("jwt expired")) {
        setErrorMessage("Session expired. Please log back in.");
      } else if (serverError) {
        setErrorMessage(`Server error: ${serverError}`);
      } else {
        setErrorMessage("❌ Could not create post. Please try again.");
      }

      toast.error("❌ Failed to post.", {
        autoClose: 3000,
        transition: Slide,
        pauseOnHover: false,
        pauseOnFocusLoss: false,
      });
    } finally {
      setLoading(false);
    }
  };

  /** ✅ #4 Drag & Drop Upload Handler */
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const file = droppedFiles[0];
      if (validateMedia(file)) {
        setMedia(file);
        toast.info("📎 Media attached via drag & drop!", { autoClose: 2000 });
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  return (
    <div
      className={`post-composer-container ${dragActive ? "drag-active" : ""}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      ref={dropRef}
    >
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening?"
          maxLength="280"
          className="composer-textarea"
          aria-label="Post content"
        />
        <p className="char-counter">
          {content.length}/280
        </p>

        {/* Emoji toggle button (non-functional for now) */}
        <button
          type="button"
          onClick={() => toast.info("🛠️ Emoji picker coming soon!", { autoClose: 2000 })}
          className="emoji-toggle-button"
        >
          😀 Emoji
        </button>

        <div className="composer-options">
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? "Posting..." : "Post"}
          </button>

          <div className="right-options">
            <MediaUpload
              onMediaSelect={(file) => {
                if (validateMedia(file)) setMedia(file);
              }}
            />
            <input
              type="text"
              value={cryptoTag}
              onChange={(e) => setCryptoTag(e.target.value)}
              placeholder="Add a crypto tag (e.g., SOL)"
              className="crypto-tag-input"
            />
          </div>
        </div>

        {media && (
          <p className="media-preview-message">📎 Media ready to upload: {media.name}</p>
        )}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </form>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        pauseOnFocusLoss={false}
        pauseOnHover={false}
        closeOnClick
        draggable
        transition={Slide}
        theme="dark"
        enableMultiContainer
      />
    </div>
  );
}

export default PostComposer;


/**
 * 🔹 **Potential Improvements:**
 * 1. **Improve Error Handling**: Display more detailed errors for failed uploads.
 * 2. **Show Media Preview**: Display selected media before posting. - SKIPPED
 * 3. **Auto-Suggest Crypto Tags**: Fetch trending crypto tags and suggest them. - SKIPPED
 * 4. **Support Drag & Drop Upload**: Allow users to drag and drop files.
 */