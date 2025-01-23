import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import SearchBar from '../../components/SearchBar';

describe('SearchBar Component', () => {
    const mockOnSearch = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        // Clear localStorage before each test
        localStorage.clear();
        jest.spyOn(localStorage, 'getItem');  // Mock localStorage.getItem
        jest.spyOn(localStorage, 'setItem');  // Mock localStorage.setItem
    });

    it('renders the search bar with input and buttons', () => {
        render(<SearchBar onSearch={mockOnSearch} suggestions={[]} filters={['all', 'posts']} />);
        expect(screen.getByPlaceholderText(/search for posts, users, or topics.../i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });

    it('displays an error message when submitting an empty query', () => {
        render(<SearchBar onSearch={mockOnSearch} suggestions={[]} filters={[]} />);
        fireEvent.click(screen.getByRole('button', { name: /search/i }));
        expect(screen.getByText(/please enter a search term/i)).toBeInTheDocument();
    });

    it('calls onSearch with correct parameters when a query is submitted', () => {
        render(<SearchBar onSearch={mockOnSearch} suggestions={[]} filters={['all', 'posts']} />);

        const input = screen.getByPlaceholderText(/search for posts, users, or topics.../i);
        fireEvent.change(input, { target: { value: 'React' } });

        fireEvent.click(screen.getByRole('button', { name: /search/i }));

        expect(mockOnSearch).toHaveBeenCalledWith({ term: 'React', filter: 'all' });
        expect(input.value).toBe('');
    });

    it('updates the search history in localStorage', () => {
        render(<SearchBar onSearch={mockOnSearch} suggestions={[]} filters={[]} />);

        const input = screen.getByPlaceholderText(/search for posts, users, or topics.../i);
        fireEvent.change(input, { target: { value: 'JavaScript' } });

        fireEvent.click(screen.getByRole('button', { name: /search/i }));

        const storedHistory = JSON.parse(localStorage.getItem('searchHistory'));
        expect(storedHistory).toEqual([{ term: 'JavaScript', filter: 'all' }]);
    });

    it('filters suggestions based on input', () => {
        const suggestions = ['React', 'Redux', 'JavaScript', 'CSS'];
        render(<SearchBar onSearch={mockOnSearch} suggestions={suggestions} filters={[]} />);

        const input = screen.getByPlaceholderText(/search for posts, users, or topics.../i);
        fireEvent.change(input, { target: { value: 'Re' } });

        expect(screen.getByText(/React/i)).toBeInTheDocument();
        expect(screen.getByText(/Redux/i)).toBeInTheDocument();
        expect(screen.queryByText(/JavaScript/i)).not.toBeInTheDocument();
    });

    it('clears suggestions when input is cleared', () => {
        const suggestions = ['React', 'Redux', 'JavaScript', 'CSS'];
        render(<SearchBar onSearch={mockOnSearch} suggestions={suggestions} filters={[]} />);

        const input = screen.getByPlaceholderText(/search for posts, users, or topics.../i);
        fireEvent.change(input, { target: { value: 'Re' } });

        expect(screen.getByText(/React/i)).toBeInTheDocument();

        fireEvent.change(input, { target: { value: '' } });

        expect(screen.queryByText(/React/i)).not.toBeInTheDocument();
    });

    it('displays and allows interaction with search history', () => {
        localStorage.setItem(
            'searchHistory',
            JSON.stringify([{ term: 'React', filter: 'all' }, { term: 'Redux', filter: 'posts' }])
        );

        render(<SearchBar onSearch={mockOnSearch} suggestions={[]} filters={['all', 'posts']} />);

        expect(screen.getByText(/search history/i)).toBeInTheDocument();
        expect(screen.getByText(/React \(all\)/i)).toBeInTheDocument();
        expect(screen.getByText(/Redux \(posts\)/i)).toBeInTheDocument();

        fireEvent.click(screen.getByText(/React \(all\)/i));

        expect(mockOnSearch).toHaveBeenCalledWith({ term: 'React', filter: 'all' });
    });

    it('allows resetting the search query and suggestions', () => {
        render(<SearchBar onSearch={mockOnSearch} suggestions={['React']} filters={[]} />);

        const input = screen.getByPlaceholderText(/search for posts, users, or topics.../i);
        fireEvent.change(input, { target: { value: 'React' } });

        expect(input.value).toBe('React');

        fireEvent.click(screen.getByRole('button', { name: /reset/i }));

        expect(input.value).toBe('');
        expect(screen.queryByText(/React/i)).not.toBeInTheDocument();
    });

    it('renders filter options if provided', () => {
        render(<SearchBar onSearch={mockOnSearch} suggestions={[]} filters={['all', 'posts']} />);

        expect(screen.getByLabelText(/search filter/i)).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /all/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /posts/i })).toBeInTheDocument();
    });

    it('calls onSearch with selected filter', () => {
        render(<SearchBar onSearch={mockOnSearch} suggestions={[]} filters={['all', 'posts']} />);

        const input = screen.getByPlaceholderText(/search for posts, users, or topics.../i);
        const filter = screen.getByLabelText(/search filter/i);

        fireEvent.change(input, { target: { value: 'React' } });
        fireEvent.change(filter, { target: { value: 'posts' } });

        fireEvent.click(screen.getByRole('button', { name: /search/i }));

        expect(mockOnSearch).toHaveBeenCalledWith({ term: 'React', filter: 'posts' });
    });
});



// Features Covered in Tests
// Rendering:

// Ensures all elements like input, buttons, and optional filters render properly.
// Error Handling:

// Tests error message display for empty search submissions.
// Search Functionality:

// Verifies that onSearch is called with the correct parameters.
// Search History:

// Confirms that search queries are stored in and retrieved from localStorage.
// Ensures history items trigger searches on click.
// Suggestions:

// Validates the filtering of suggestions based on the input.
// Reset Functionality:

// Tests that clicking reset clears input and suggestions.
// Filters:

// Ensures filters are rendered and used in search queries.