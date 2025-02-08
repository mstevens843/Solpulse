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