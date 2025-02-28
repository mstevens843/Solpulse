import React, { useState } from "react";
import { api } from "@/api/apiConfig";
import MediaUpload from "@/components/Post_components/MediaUpload";
import "@/css/components/Post_components/PostComposer.css";
import { toast, ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function PostComposer({ onPostCreated }) {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [cryptoTag, setCryptoTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const validateMedia = (file) => {
    const allowedTypes = ["image/jpeg", "image/png", "video/mp4"];
    const maxSize = 5 * 1024 * 1024;

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
    setErrorMessage("");

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

      // Toast message for successful post creation with dismiss options
      toast.success("Post created successfully!", {
        autoClose: 3000,
        closeOnClick: true,
        closeButton: true,
        draggable: true,
        transition: Slide,
        pauseOnHover: false, // Ensure it doesn't pause on hover
        pauseOnFocusLoss: false, // Avoid pausing when the tab loses focus
      });
    } catch (error) {
      console.error("Error creating post:", error);

      const serverError = error.response?.data?.error;

      if (serverError && serverError.toLowerCase().includes("jwt expired")) {
        setErrorMessage("Please log back in.");
      } else {
        setErrorMessage(serverError || "Failed to create the post. Please try again.");
      }
      toast.error("Failed to create the post.", {
        autoClose: 3000,
        closeOnClick: true,
        closeButton: true,
        draggable: true,
        transition: Slide,
        pauseOnHover: false,
        pauseOnFocusLoss: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-composer-container">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening?"
          maxLength="280"
          className="composer-textarea"
          aria-label="Post content"
        />

        {/* New Row for Media Upload & Crypto Tag */}
        <div className="composer-options">
          {/* Post Button on the Left */}
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? "Posting..." : "Post"}
          </button>

          {/* Camera Icon & Crypto Tag on the Right */}
          <div className="right-options">
            <MediaUpload
              onMediaSelect={(file) => {
                if (validateMedia(file)) setMedia(file);
              }}
            />
            <input
              type="text"
              value={cryptoTag}
              onChange={(e) => {
                console.log("Crypto tag input:", e.target.value);
                setCryptoTag(e.target.value);
              }}
              placeholder="Add a crypto tag (e.g., SOL)"
              className="crypto-tag-input"
            />
          </div>
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </form>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="dark"
        enableMultiContainer
      />
    </div>
  );
}

export default PostComposer;
