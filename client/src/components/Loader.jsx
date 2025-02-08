import React from "react";
import "@/css/components/Loader.css"; // Updated alias for CSS import

function Loader() {
    return (
        <div className="loader-container" role="status" aria-live="polite">
            <div className="loader" aria-hidden="true"></div>
            <p className="loader-text">Loading...</p>
        </div>
    );
}

export default Loader;