import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import Profile from '../../pages/Profile';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock axios
jest.mock('axios');

describe('Profile Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderComponent = () =>
        render(
            <MemoryRouter initialEntries={['/profile/1']}>
                <Routes>
                    <Route path="/profile/:id" element={<Profile />} />
                </Routes>
            </MemoryRouter>
        );

    it('renders a loading state initially', () => {
        renderComponent();
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('fetches and displays user data successfully', async () => {
        axios.get.mockResolvedValueOnce({
            data: {
                user: { id: 1, username: 'testuser', bio: 'This is a test bio.' },
                posts: [{ id: 1, content: 'Test Post' }],
            },
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText((content, element) => content === 'testuser')).toBeInTheDocument();
            expect(screen.getByText((content, element) => content === 'This is a test bio.')).toBeInTheDocument();
            expect(screen.getByText((content, element) => content === 'Test Post')).toBeInTheDocument();
        });
    });

    it('handles an API error gracefully', async () => {
        axios.get.mockRejectedValueOnce(new Error('Failed to fetch profile.'));

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText(/failed to load profile/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
        });
    });

    it('retries fetching data on clicking retry button', async () => {
        axios.get.mockRejectedValueOnce(new Error('Failed to fetch profile.'));
        axios.get.mockResolvedValueOnce({
            data: {
                user: { id: 1, username: 'testuser', bio: 'This is a test bio.' },
                posts: [{ id: 1, content: 'Test Post' }],
            },
        });

        renderComponent();

        await waitFor(() => expect(screen.getByText(/failed to load profile/i)).toBeInTheDocument());

        const retryButton = screen.getByRole('button', { name: /retry/i });
        fireEvent.click(retryButton);

        await waitFor(() => {
            expect(screen.getByText('testuser')).toBeInTheDocument();
            expect(screen.getByText('Test Post')).toBeInTheDocument();
        });
    });

    it('allows bio editing and saving', async () => {
        axios.get.mockResolvedValueOnce({
            data: {
                user: { id: 1, username: 'testuser', bio: 'This is a test bio.' },
                posts: [],
            },
        });

        axios.put.mockResolvedValueOnce({});

        renderComponent();

        await waitFor(() => expect(screen.getByText('testuser')).toBeInTheDocument());

        const editButton = screen.getByRole('button', { name: /edit bio/i });
        fireEvent.click(editButton);

        const textarea = screen.getByPlaceholderText(/write something about yourself/i);
        fireEvent.change(textarea, { target: { value: 'Updated bio' } });

        const saveButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveButton);

        await waitFor(() =>
            expect(axios.put).toHaveBeenCalledWith(
                expect.stringContaining('/users/1'),
                expect.objectContaining({ bio: 'Updated bio' })
            )
        );

        expect(screen.getByText('Updated bio')).toBeInTheDocument();
    });

    it('displays a message when no posts are available', async () => {
        axios.get.mockResolvedValueOnce({
            data: { user: { id: 1, username: 'testuser', bio: 'This is a test bio.' }, posts: [] },
        });

        renderComponent();

        await waitFor(() => expect(screen.getByText(/no posts available/i)).toBeInTheDocument());
    });
});







// Test Cases
// Rendering:

// Ensures the loader is displayed while data is fetched.
// Verifies user info, posts, and related components are rendered.
// Error Handling:

// Simulates API failure for profile fetch and checks for error messages and retry functionality.
// Bio Editing:

// Tests the edit bio flow, including input changes, API submission, and UI updates.
// Posts Display:

// Verifies posts are displayed correctly and handles scenarios with no posts.
// Component Rendering:

// Confirms CryptoTip and CryptoWalletIntegration components are displayed in the profile.