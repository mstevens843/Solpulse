import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import FollowButton from '../../components/Profile_components/FollowButton';

// Mock axios for API calls
jest.mock('axios');

// Mock the Loader component from the correct path
jest.mock('../../components/Loader', () => {
    return function Loader({ size }) {
        return <div data-testid="loader">{`Loader ${size}`}</div>;
    };
});

describe('FollowButton Component', () => {
    const mockUserId = 1;
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the Follow button by default if not following', async () => {
        axios.get.mockResolvedValueOnce({ data: { isFollowing: false } });

        render(<FollowButton userId={mockUserId} />);

        const followButton = await screen.findByRole('button', { name: /follow/i });
        expect(followButton).toBeInTheDocument();
        expect(followButton).not.toBeDisabled();
    });

    it('renders the Unfollow button if the user is already being followed', async () => {
        axios.get.mockResolvedValueOnce({ data: { isFollowing: true } });

        render(<FollowButton userId={mockUserId} />);

        const unfollowButton = await screen.findByRole('button', { name: /unfollow/i });
        expect(unfollowButton).toBeInTheDocument();
        expect(unfollowButton).not.toBeDisabled();
    });

    it('toggles the follow state when the button is clicked', async () => {
        axios.get.mockResolvedValueOnce({ data: { isFollowing: false } });
        axios.post.mockResolvedValueOnce({});

        render(<FollowButton userId={mockUserId} />);

        const followButton = await screen.findByRole('button', { name: /follow/i });
        fireEvent.click(followButton);

        expect(axios.post).toHaveBeenCalledWith(`${API_URL}/users/${mockUserId}/follow`);
        await waitFor(() => expect(screen.getByRole('button', { name: /unfollow/i })).toBeInTheDocument());
    });

    it('displays an error message if the follow/unfollow action fails', async () => {
        axios.get.mockResolvedValueOnce({ data: { isFollowing: false } });
        axios.post.mockRejectedValueOnce(new Error('Network error'));

        render(<FollowButton userId={mockUserId} />);

        const followButton = await screen.findByRole('button', { name: /follow/i });
        fireEvent.click(followButton);

        await waitFor(() =>
            expect(screen.getByText(/failed to update follow status/i)).toBeInTheDocument()
        );
    });

    it('displays a loader while the follow/unfollow request is in progress', async () => {
        axios.get.mockResolvedValueOnce({ data: { isFollowing: false } });
        axios.post.mockImplementation(
            () =>
                new Promise((resolve) => {
                    setTimeout(resolve, 500);
                })
        );

        render(<FollowButton userId={mockUserId} />);

        const followButton = await screen.findByRole('button', { name: /follow/i });
        fireEvent.click(followButton);

        expect(screen.getByTestId('loader')).toBeInTheDocument();
        await waitFor(() => expect(screen.getByRole('button', { name: /unfollow/i })).toBeInTheDocument());
    });

    it('disables the button while the follow/unfollow request is in progress', async () => {
        axios.get.mockResolvedValueOnce({ data: { isFollowing: false } });
        axios.post.mockImplementation(
            () =>
                new Promise((resolve) => {
                    setTimeout(resolve, 500);
                })
        );

        render(<FollowButton userId={mockUserId} />);

        const followButton = await screen.findByRole('button', { name: /follow/i });
        fireEvent.click(followButton);

        expect(followButton).toBeDisabled();
    });

    it('renders an error message if fetching follow status fails', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network error'));

        render(<FollowButton userId={mockUserId} />);

        await waitFor(() =>
            expect(screen.getByText(/failed to load follow status/i)).toBeInTheDocument()
        );
    });
});



// Key Test Cases
// Initial Rendering:

// Ensures the correct button (Follow or Unfollow) is rendered based on the API response.
// Toggle Follow State:

// Tests the functionality of the button when toggling the follow state.
// Verifies the correct API call (/follow or /unfollow).
// Error Handling:

// Ensures proper error messages are displayed when the API calls fail.
// Loader Visibility:

// Verifies that the loader appears during API calls and disappears afterward.
// Button State:

// Confirms the button is disabled during API calls.
// API Failure on Initial Load:

// Tests the component's behavior when fetching the follow status fails.
