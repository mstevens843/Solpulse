import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import FollowersFollowing from '../../components/FollowersFollowing';

jest.mock('axios');
jest.mock('../../components/UserCard', () => jest.fn(({ user }) => (
    <div data-testid="user-card">{user.username}</div>
)));

describe('FollowersFollowing Component', () => {
    const mockFollowers = [
        { id: 1, username: 'follower1' },
        { id: 2, username: 'follower2' },
    ];

    const mockFollowing = [
        { id: 3, username: 'following1' },
        { id: 4, username: 'following2' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing and displays headers', () => {
        render(<FollowersFollowing userId={1} />);
        
        // Ensure headers are displayed
        expect(screen.getByText(/Followers \(0\)/i)).toBeInTheDocument();
        expect(screen.getByText(/Following \(0\)/i)).toBeInTheDocument();
    });

    it('fetches and displays followers and following data', async () => {
        axios.get
            .mockResolvedValueOnce({ data: { followers: mockFollowers } })
            .mockResolvedValueOnce({ data: { following: mockFollowing } });

        render(<FollowersFollowing userId={1} />);

        // Verify loading state
        expect(screen.getByText(/loading followers and following data/i)).toBeInTheDocument();

        // Wait for the user cards to be rendered
        await waitFor(() => {
            expect(screen.getAllByTestId('user-card')).toHaveLength(4); // Expecting 4 cards
        });

        // Verify API calls
        expect(axios.get).toHaveBeenCalledWith(
            `${process.env.REACT_APP_API_URL}/users/1/followers`
        );
        expect(axios.get).toHaveBeenCalledWith(
            `${process.env.REACT_APP_API_URL}/users/1/following`
        );

        // Verify displayed data for followers and following
        expect(screen.getByText(/follower1/i)).toBeInTheDocument();
        expect(screen.getByText(/follower2/i)).toBeInTheDocument();
        expect(screen.getByText(/following1/i)).toBeInTheDocument();
        expect(screen.getByText(/following2/i)).toBeInTheDocument();
    });

    it('displays error message if API call fails', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network error'));

        render(<FollowersFollowing userId={1} />);

        await waitFor(() => {
            expect(screen.getByText(/failed to fetch followers and following/i)).toBeInTheDocument();
        });
    });

    it('handles empty followers and following data gracefully', async () => {
        axios.get
            .mockResolvedValueOnce({ data: { followers: [] } })
            .mockResolvedValueOnce({ data: { following: [] } });

        render(<FollowersFollowing userId={1} />);

        await waitFor(() => {
            expect(screen.getByText(/no followers yet/i)).toBeInTheDocument();
            expect(screen.getByText(/not following anyone yet/i)).toBeInTheDocument();
        });
    });

    it('renders loading state while fetching data', () => {
        axios.get.mockImplementation(() => new Promise(() => {})); // Simulate unresolved promise

        render(<FollowersFollowing userId={1} />);

        expect(screen.getByText(/loading followers and following data/i)).toBeInTheDocument();
    });
});







// Features Covered in Tests
// Basic Rendering:

// Confirms headers and initial layout render correctly.
// API Call Success:

// Simulates successful API calls to fetch followers and following data.
// Verifies that UserCard components are rendered based on the API data.
// Error Handling:

// Simulates API failures and ensures error messages are displayed.
// Empty States:

// Verifies appropriate messages are displayed when no followers or following data exists.
// Loading State:

// Ensures a loading message is displayed while data is being fetched.
