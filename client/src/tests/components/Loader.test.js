import React from 'react';
import { render, screen } from '@testing-library/react';
import Loader from '../../components/Loader';

describe('Loader Component', () => {
    it('renders the loader container with appropriate accessibility attributes', () => {
        render(<Loader />);

        const loaderContainer = screen.getByRole('status');
        expect(loaderContainer).toBeInTheDocument();
        expect(loaderContainer).toHaveAttribute('aria-live', 'polite');
    });

    it('renders the loader element', () => {
        render(<Loader />);

        const loaderElement = screen.getByRole('status', { hidden: true });
        expect(loaderElement).toBeInTheDocument();
    });

    it('renders the loading text', () => {
        render(<Loader />);

        const loadingText = screen.getByText(/loading.../i);
        expect(loadingText).toBeInTheDocument();
    });

    it('applies the correct CSS classes', () => {
        render(<Loader />);

        const loaderContainer = screen.getByRole('status');
        expect(loaderContainer).toHaveClass('loader-container');

        // Check if the inner loader div has the 'loader' class
        const loaderElement = screen.getByRole('status').querySelector('.loader');
        expect(loaderElement).toHaveClass('loader');
    });
});




// Key Test Cases
// Accessibility Attributes:

// Verifies that the loader has the correct ARIA attributes for accessibility, such as role="status" and aria-live="polite".
// Loader Element Render:

// Ensures the loader spinner is rendered properly.
// Loading Text Render:

// Verifies that the "Loading..." text is present in the DOM.
// CSS Class Validation:

// Checks that the component has the correct CSS classes applied for styling.