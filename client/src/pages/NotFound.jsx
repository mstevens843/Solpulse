/**
 * NotFound.js - 404 Error Page for SolPulse
 *
 * This file is responsible for:
 * - Displaying a user-friendly message when a non-existent page is accessed.
 * - Providing a link back to the homepage for easy navigation.
 */


import React from 'react';
import { Link } from 'react-router-dom';
import '@/css/pages/NotFound.css';

function NotFound() {
    return (
        <div className="not-found-container" role="alert">
            <h1>404 - Page Not Found</h1>
            <p>The page you’re looking for doesn’t exist or may have been removed.</p>
            <Link to="/home" className="home-link" aria-label="Return to the homepage">
                Go Back Home
            </Link>
        </div>
    );
}

export default NotFound;


/**
 * 🔹 Potential Improvements:
 * - Add a search bar to help users find relevant content.
 * - Include recommended pages based on recent activity or trending topics.
 * - Improve visual design with an engaging illustration or animation.
 */