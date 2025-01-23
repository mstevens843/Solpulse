// Loader component you can use to display a simple loading animation or spinner across your project.

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




// Purpose: A reusable loading indicator for any part of the application where data or actions take time to process.
// Usage: Simply import and include <Loader /> where loading states need to be displayed.
// Appearance: A circular spinner with a "Loading..." message (you can further customize it).

// Changes Made:
// role="status":

// Added role="status" to indicate to assistive technologies that this component provides feedback to the user.
// aria-live="polite":

// Ensures that screen readers announce the loading text politely without interrupting the current focus.
// aria-hidden="true":

// Added to the visual spinner element to prevent redundant announcements by screen readers.