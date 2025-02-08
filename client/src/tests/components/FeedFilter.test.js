import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FeedFilter from '../../components/Post_components/FeedFilter';

describe('FeedFilter Component', () => {
    it('renders the filter dropdown and label', () => {
        render(<FeedFilter />);

        // Check if label is rendered
        expect(screen.getByLabelText(/Filter feed by category/i)).toBeInTheDocument();

        // Check if the default selected value is 'posts'
        expect(screen.getByRole('combobox')).toHaveValue('posts');
    });

    it('calls onFilterChange when a new filter is selected', () => {
        const mockOnFilterChange = jest.fn();
        render(<FeedFilter onFilterChange={mockOnFilterChange} />);

        const selectElement = screen.getByRole('combobox');

        // Change to 'crypto'
        fireEvent.change(selectElement, { target: { value: 'crypto' } });
        expect(mockOnFilterChange).toHaveBeenCalledWith('crypto');

        // Change to 'media'
        fireEvent.change(selectElement, { target: { value: 'media' } });
        expect(mockOnFilterChange).toHaveBeenCalledWith('media');
    });

    it('updates the selected filter when the user selects a new option', () => {
        render(<FeedFilter />);

        const selectElement = screen.getByRole('combobox');

        // Default should be 'posts'
        expect(selectElement).toHaveValue('posts');

        // Change to 'crypto'
        fireEvent.change(selectElement, { target: { value: 'crypto' } });
        expect(selectElement).toHaveValue('crypto');

        // Change to 'media'
        fireEvent.change(selectElement, { target: { value: 'media' } });
        expect(selectElement).toHaveValue('media');
    });
});