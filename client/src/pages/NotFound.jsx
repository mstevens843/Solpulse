import React from 'react';
import { Link } from 'react-router-dom';
import '@/css/pages/NotFound.css'; // Updated alias for Vite compatibility

function NotFound() {
    return (
        <div className="not-found-container" role="alert">
            <h1>404 - Page Not Found</h1>
            <p>The page you’re looking for doesn’t exist or may have been removed.</p>
            <Link to="/" className="home-link" aria-label="Return to the homepage">
                Go Back Home
            </Link>
        </div>
    );
}

export default NotFound;
