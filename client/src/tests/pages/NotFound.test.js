import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import NotFound from '../../pages/NotFound';

describe('NotFound Page', () => {
    it('renders the NotFound page with the correct message', () => {
        render(
            <Router>
                <NotFound />
            </Router>
        );

        // Check if the heading is present with the correct text content
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveTextContent('404 - Page Not Found');

        // Check if the paragraph with the error message is present
        const paragraph = screen.getByText(
            /the page you’re looking for doesn’t exist or may have been removed\./i
        );
        expect(paragraph).toBeInTheDocument();

        // Check if the link to go back home is present and has correct href
        const homeLink = screen.getByRole('link', { name: /go back home/i });
        expect(homeLink).toBeInTheDocument();
        expect(homeLink).toHaveAttribute('href', '/');
    });
});




// Key Features Tested
// Rendering:
// Verifies the page title and message appear correctly.
// Confirms the link to navigate back home is present and functional.
// Accessibility:
// Ensures proper role and aria attributes for screen readers.