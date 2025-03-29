/**
 * ErrorBoundary.js - A React component for catching and handling UI errors.
 *
 * This file is responsible for:
 * - Catching errors in the component tree and displaying a fallback UI.
 * - Logging errors for debugging purposes.
 * - Providing a retry mechanism to reload the application.
 */


import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorKey: Date.now() }; // 🔑 add errorKey
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  /**
   * ✅ Recover without page reload.
   * Re-mounts children with new key.
   */
  handleRetry = () => {
    this.setState({ hasError: false, errorKey: Date.now() }); // ✅ reset + new key
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h1>Something went wrong.</h1>
          <p>Try again or refresh the page.</p>
          <button onClick={this.handleRetry}>Try Again</button>
        </div>
      );
    }

    // ✅ Key forces re-mount on retry
    return <div key={this.state.errorKey}>{this.props.children}</div>;
  }
}

export default ErrorBoundary;


/**
 * 🔹 Potential Improvements:
 * - Integrate an error reporting service (e.g., Sentry, LogRocket) for tracking errors. - SKIPPED
 * - Provide a user-friendly UI with a "Report Issue" button linking to support. - SKIPPED 
 * - Optionally allow recovering from errors without reloading the page. 
 */


/**
 * means: instead of always reloading the entire app, let the user continue using the 
 * site by resetting only the part that crashed, without a full window.location.reload().
 * When the user clicks "Try Again", it resets hasError: false.
 * But instead of doing window.location.reload(), it re-renders the children from scratch.
 */