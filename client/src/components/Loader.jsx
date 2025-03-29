/**
 * Loader.js - A simple loading spinner component.
 *
 * This file is responsible for:
 * - Displaying a loading animation when content is being fetched.
 * - Providing accessible feedback using ARIA attributes.
 */

import React from "react";
import "@/css/components/Loader.css"; 

function Loader() {
    return (
        <div className="loader-container" role="status" aria-live="polite">
            <div className="loader" aria-hidden="true"></div>
            <p className="loader-text">Loading...</p>
        </div>
    );
}

export default Loader;

/**
 * 🔹 Potential Improvements:
 * - Allow customization of the loader message via props.
 * - Add support for different loader styles (e.g., circular, bar, dots).
 * - Implement a timeout message if loading takes too long.
 */