/**
 * This file is responsible for:
 * - Rendering the root React component (`App`).
 * - Wrapping the application in `AuthProvider` for authentication context.
 * - Implementing `ErrorBoundary` to catch unexpected UI errors.
 * - Setting up `ToastContainer` for user notifications.
 * - Importing global CSS styles.
 */


import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './css/index.css';
// import './css/Global.css';
import './index2.css';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AuthProvider } from '@/context/AuthContext'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <ErrorBoundary>
            <AuthProvider>
                <ToastContainer />
                <App />
            </AuthProvider>
        </ErrorBoundary>
     </React.StrictMode>
);

reportWebVitals();