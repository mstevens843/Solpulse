import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import Explore from '../../components/Explore';

jest.mock('axios');

// Mocking SearchBar component
jest.mock('../../components/SearchBar', () => jest.fn(({ query, setQuery, onSearch }) => (
    <div data-testid="search-bar">
        <input
            data-testid="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
        />
        <button data-testid="search-button" onClick={onSearch}>
            Search
        </button>
    </div>
)));

// Mocking Hashtag component
jest.mock('../../components/Hashtag', () => jest.fn(({ content }) => (
    <span data-testid="hashtag">{`#${content}`}</span>
)));

describe('Explore Component', () => {
    const mockTrendingPosts = [
        { id: 1, author: 'User1', content: 'Solana is trending!' },
        { id: 2, author: 'User2', content: 'Check out $SOL updates.' },
    ];

    const mockSearchResults = [
        { id: 3, author: 'User3', content: 'Search result for Solana.' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the Explore page correctly', () => {
        render(<Explore />);
        expect(screen.getByText(/explore/i)).toBeInTheDocument();
        expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    });

    it('fetches and displays trending posts on mount', async () => {
        axios.get.mockResolvedValueOnce({ data: { posts: mockTrendingPosts } });

        render(<Explore />);

        // Wait for loading state
        expect(screen.getByText(/loading/i)).toBeInTheDocument();

        // Wait for trending posts to appear
        await waitFor(() => {
            expect(screen.getByText(/solana is trending!/i)).toBeInTheDocument();
            expect(screen.getByText(/check out \$sol updates/i)).toBeInTheDocument();
        });

        // Verify API call
        expect(axios.get).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/posts/trending`);
    });

    it('displays an error message if fetching trending posts fails', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network error'));

        render(<Explore />);

        // Wait for error message
        await waitFor(() => {
            expect(screen.getByText(/failed to load trending posts/i)).toBeInTheDocument();
        });
    });

    it('handles search and displays search results', async () => {
        axios.get.mockResolvedValueOnce({ data: { posts: mockTrendingPosts } }); // Initial fetch
        axios.get.mockResolvedValueOnce({ data: { posts: mockSearchResults } }); // Search results

        render(<Explore />);

        // Wait for trending posts to load
        await waitFor(() => {
            expect(screen.getByText(/solana is trending!/i)).toBeInTheDocument();
        });

        // Simulate search input and click
        fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'Solana' } });
        fireEvent.click(screen.getByTestId('search-button'));

        // Wait for search results
        await waitFor(() => {
            expect(screen.getByText(/search result for solana/i)).toBeInTheDocument();
        });

        // Verify API call
        expect(axios.get).toHaveBeenCalledWith(
            `${process.env.REACT_APP_API_URL}/posts/search?query=Solana`
        );
    });

    it('displays a loading state during search', async () => {
        axios.get.mockResolvedValueOnce({ data: { posts: mockTrendingPosts } }); // Initial fetch
        axios.get.mockResolvedValueOnce(new Promise(() => {})); // Simulate delay for search

        render(<Explore />);

        // Wait for trending posts
        await waitFor(() => {
            expect(screen.getByText(/solana is trending!/i)).toBeInTheDocument();
        });

        // Simulate search click
        fireEvent.click(screen.getByTestId('search-button'));

        // Check for loading state
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('displays an empty state if no posts are found', async () => {
        axios.get.mockResolvedValueOnce({ data: { posts: [] } });

        render(<Explore />);

        // Wait for empty state message
        await waitFor(() => {
            expect(screen.getByText(/no trending posts found/i)).toBeInTheDocument();
        });
    });
});