import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import Feed from '../../pages/Feed';

// Mock Axios
jest.mock('axios');

describe('Feed Component', () => {
    const mockPosts = [
        { id: 1, username: 'User1', content: 'Hello World!' },
        { id: 2, username: 'User2', content: 'This is a test post.' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the loading state initially', () => {
        render(<Feed />);
        expect(screen.getByText(/Loading posts.../i)).toBeInTheDocument();
    });

    it('renders posts after successful API call', async () => {
        axios.get.mockResolvedValueOnce({ data: { posts: mockPosts } });

        render(<Feed />);

        await waitFor(() => {
            expect(screen.getByText(/Community Feed/i)).toBeInTheDocument();
            expect(screen.getByText(/Hello World!/i)).toBeInTheDocument();
            expect(screen.getByText(/This is a test post./i)).toBeInTheDocument();
        });
    });

    it('renders error message on API failure', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network Error'));

        render(<Feed />);

        await waitFor(() => {
            expect(screen.getByText(/Failed to load posts. Please try again later./i)).toBeInTheDocument();
        });
    });

    it('renders empty state when no posts are available', async () => {
        axios.get.mockResolvedValueOnce({ data: { posts: [] } });

        render(<Feed />);

        await waitFor(() => {
            expect(screen.getByText(/No posts available. Start the conversation!/i)).toBeInTheDocument();
        });
    });

    it('retries fetching posts on retry button click', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network Error'));
        axios.get.mockResolvedValueOnce({ data: { posts: mockPosts } });

        render(<Feed />);

        // Wait for error message
        await waitFor(() => {
            expect(screen.getByText(/Failed to load posts. Please try again later./i)).toBeInTheDocument();
        });

        // Retry fetching posts
        fireEvent.click(screen.getByText(/Retry/i));

        // Wait for successful post render
        await waitFor(() => {
            expect(screen.getByText(/Hello World!/i)).toBeInTheDocument();
        });
    });

    it('disables retry button while retrying', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network Error'));
    
        render(<Feed />);
    
        // Wait for error message
        await waitFor(() => {
            expect(screen.getByText(/Failed to load posts. Please try again later./i)).toBeInTheDocument();
        });
    
        const retryButton = screen.getByText(/Retry/i);
    
        // Ensure retry button is enabled initially
        expect(retryButton).not.toBeDisabled();
    
        // Mock retry action
        axios.get.mockResolvedValueOnce({ data: { posts: mockPosts } });
    
        // Simulate retry
        fireEvent.click(retryButton);
    
        // Ensure button is disabled during retry
        expect(retryButton).toBeDisabled();
    
        // Wait for the API response to complete
        await waitFor(() => {
            expect(retryButton).not.toBeDisabled(); // Button should be re-enabled after retry finishes
        });
    });
    
});





// Key Test Cases
// Loading State:

// Ensures the "Loading posts..." message appears initially.
// Successful Fetch:

// Verifies that posts are displayed after a successful API call.
// Error Handling:

// Ensures an error message is shown when the API call fails.
// Empty State:

// Confirms that a message is displayed when no posts are available.
// Retry Functionality:

// Tests the retry button and ensures posts are fetched after retrying.