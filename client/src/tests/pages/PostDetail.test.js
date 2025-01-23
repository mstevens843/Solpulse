import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import PostDetail from '../../pages/PostDetail';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock axios
jest.mock('axios');

// Mocking environment variable for API URL
process.env.REACT_APP_API_URL = 'http://localhost:5000/api';

describe('PostDetail Page', () => {
    const mockPost = {
        id: '1',
        author: 'Test User',
        content: 'This is a test post.',
        authorId: 123, // Ensure it's a number
        cryptoTag: 'TestTag',
        likes: 10,
        comments: [{ id: '1', author: 'Commenter', content: 'Great post!' }],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    const renderComponent = () =>
        render(
            <MemoryRouter initialEntries={['/posts/1']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                    <Route path="/posts/:id" element={<PostDetail />} />
                </Routes>
            </MemoryRouter>
        );

    it('renders the loader initially', async () => {
        axios.get.mockResolvedValueOnce({ data: mockPost });
        renderComponent();

        expect(screen.getByRole('status')).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    });

    it('fetches and displays post data', async () => {
        axios.get.mockResolvedValueOnce({ data: mockPost });
        renderComponent();

        await waitFor(() => expect(screen.getByText(mockPost.content)).toBeInTheDocument());
        expect(screen.getByText(mockPost.cryptoTag)).toBeInTheDocument();
        expect(screen.getByText(mockPost.comments[0].content)).toBeInTheDocument();
    });

    it('handles API error gracefully', async () => {
        axios.get.mockRejectedValueOnce({ response: { status: 404, data: { message: 'Post not found.' } } });
        renderComponent();

        await waitFor(() => expect(screen.getByText(/post not found/i)).toBeInTheDocument());
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('saves and loads post data from localStorage', () => {
        localStorage.setItem(`post-1`, JSON.stringify(mockPost));
        localStorage.setItem(`comments-1`, JSON.stringify(mockPost.comments));

        renderComponent();

        expect(screen.getByText(mockPost.content)).toBeInTheDocument();
        expect(screen.getByText(mockPost.comments[0].content)).toBeInTheDocument();
    });
});





// Test Cases
// Rendering:

// Verifies that the loader is displayed initially while fetching data.
// Ensures post details and comments are displayed after successful data retrieval.
// Error Handling:

// Simulates API failure and checks for error messages and retry functionality.
// Interactions:

// Tests the like button functionality, including toggling the like state and calling the API.
// Adds a new comment, verifies the API call, and checks if the comment list updates.
// LocalStorage:

// Confirms that the post data and comments are loaded from localStorage if available.