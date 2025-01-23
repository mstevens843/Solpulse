import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SearchResults from '../../pages/SearchResults';

jest.mock('axios');

describe('SearchResults Page', () => {
    const mockQuery = 'test';
    const mockResults = [
        { id: '1', type: 'user', username: 'TestUser', bio: 'Test Bio' },
        { id: '2', type: 'post', content: 'Test Post Content', author: 'TestAuthor' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderComponent = (query = mockQuery) =>
        render(
            <MemoryRouter initialEntries={[`/search?query=${query}`]}>
                <Routes>
                    <Route path="/search" element={<SearchResults />} />
                </Routes>
            </MemoryRouter>
        );

    it('renders loader while fetching results', async () => {
        axios.get.mockResolvedValueOnce({ data: { results: mockResults, totalPages: 1 } });

        renderComponent();
        expect(screen.getByRole('status')).toBeInTheDocument(); // Loader is displayed
        await waitFor(() => screen.getByText('TestUser')); // Wait for data to be loaded
        expect(screen.queryByRole('status')).not.toBeInTheDocument(); // Loader should disappear
    });

    it('renders results for a given query', async () => {
        axios.get.mockResolvedValueOnce({ data: { results: mockResults, totalPages: 1 } });

        renderComponent();

        await waitFor(() => screen.getByText('Search Results for "test"'));

        // Ensure both user and post results are displayed
        expect(screen.getByText('TestUser')).toBeInTheDocument();
        expect(screen.getByText('Test Bio')).toBeInTheDocument();
        expect(screen.getByText('Test Post Content')).toBeInTheDocument();
        expect(screen.getByText('TestAuthor')).toBeInTheDocument();
    });

    it('displays an error message when the API fails', async () => {
        axios.get.mockRejectedValueOnce(new Error('API Error'));

        renderComponent();

        await waitFor(() => screen.getByText('Failed to fetch search results. Please try again.'));
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('displays a no results message for an empty response', async () => {
        axios.get.mockResolvedValueOnce({ data: { results: [], totalPages: 0 } });

        renderComponent();

        await waitFor(() =>
            screen.getByText(/no results found for "test"/i)
        );
    });

    it('handles pagination and loads more results on button click', async () => {
        const firstPageResults = [{ id: '1', type: 'user', username: 'FirstUser' }];
        const secondPageResults = [{ id: '2', type: 'post', content: 'Second Post Content' }];

        axios.get
            .mockResolvedValueOnce({ data: { results: firstPageResults, totalPages: 2 } }) // First page
            .mockResolvedValueOnce({ data: { results: secondPageResults, totalPages: 2 } }); // Second page

        renderComponent();

        await waitFor(() => screen.getByText('FirstUser'));
        expect(screen.queryByText('Second Post Content')).not.toBeInTheDocument();

        const loadMoreButton = screen.getByRole('button', { name: /load more/i });
        fireEvent.click(loadMoreButton);

        await waitFor(() => screen.getByText('Second Post Content'));
        expect(screen.getByText('Second Post Content')).toBeInTheDocument();
    });

    it('updates results when a new search is submitted', async () => {
        const initialResults = [{ id: '1', type: 'user', username: 'InitialUser' }];
        const newSearchResults = [{ id: '2', type: 'post', content: 'New Search Result' }];

        axios.get
            .mockResolvedValueOnce({ data: { results: initialResults, totalPages: 1 } }) // Initial query
            .mockResolvedValueOnce({ data: { results: newSearchResults, totalPages: 1 } }); // New query

        renderComponent();

        await waitFor(() => screen.getByText('InitialUser'));

        const searchInput = screen.getByPlaceholderText(/search for posts, users, or topics/i);
        fireEvent.change(searchInput, { target: { value: 'new search' } });

        const searchButton = screen.getByRole('button', { name: /search/i });
        fireEvent.click(searchButton);

        await waitFor(() => screen.getByText('New Search Result'));
        expect(screen.queryByText('InitialUser')).not.toBeInTheDocument();
        expect(screen.getByText('New Search Result')).toBeInTheDocument();
    });

    it('does not fetch results if query is empty', async () => {
        renderComponent('');

        await waitFor(() =>
            expect(axios.get).not.toHaveBeenCalled()
        );

        expect(screen.getByText(/search results for ""/i)).toBeInTheDocument();
    });
});






// Test Cases
// Loading State:

// Verifies the loader is displayed while results are being fetched.
// Successful Fetch:

// Renders search results for users and posts.
// Error Handling:

// Displays an error message and retry button when the API call fails.
// No Results:

// Displays a message when no results are found.
// Pagination:

// Tests "Load More" functionality for fetching additional pages.
// Query Updates:

// Updates results when a new search query is submitted.
// Empty Query:

// Ensures no API call is made for an empty query.