import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Home from '../../pages/LandingPage';

jest.mock('../../components/NotificationBell', () => () => <div data-testid="notification-bell"></div>);
jest.mock('../../components/CryptoTicker', () => () => <div data-testid="crypto-ticker"></div>);
jest.mock('../../components/Feed', () => () => <div data-testid="feed"></div>);
jest.mock('../../components/FeedFilter', () => () => <div data-testid="feed-filter"></div>);

describe('Home Component', () => {
    const mockUser = { username: 'solanaUser' };
    const mockFetch = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = mockFetch;
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders the Home page with static elements', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockUser,
        });

        await act(async () => {
            render(
                <Router>
                    <Home />
                </Router>
            );
        });

        expect(screen.getByText(/Welcome to SolPulse/i)).toBeInTheDocument();
        expect(screen.getByText(/Explore the Latest Solana Ecosystem Trends/i)).toBeInTheDocument();
        expect(screen.getByText(/Your Feed/i)).toBeInTheDocument();
        expect(screen.getByText(/Don't have an account\?/i)).toBeInTheDocument();
        expect(screen.getByText(/Already have an account\?/i)).toBeInTheDocument();
    });

    it('fetches and displays user data successfully', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockUser,
        });

        await act(async () => {
            render(
                <Router>
                    <Home />
                </Router>
            );
        });

        await waitFor(() => {
            expect(screen.getByText(/Hello, solanaUser!/i)).toBeInTheDocument();
        });
    });

    it('handles fetch errors and displays an error message', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Failed to fetch user data.'));

        await act(async () => {
            render(
                <Router>
                    <Home />
                </Router>
            );
        });

        await waitFor(() => {
            expect(
                screen.getByText(/Failed to load user data. Please try again later./i)
            ).toBeInTheDocument();
        });
    });

    it('renders child components correctly', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockUser,
        });

        await act(async () => {
            render(
                <Router>
                    <Home />
                </Router>
            );
        });

        await waitFor(() => {
            expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
            expect(screen.getByTestId('crypto-ticker')).toBeInTheDocument();
            expect(screen.getByTestId('feed')).toBeInTheDocument();
            expect(screen.getByTestId('feed-filter')).toBeInTheDocument();
        });
    });

    it('displays a welcome message for unauthenticated users', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => null,
        });

        await act(async () => {
            render(
                <Router>
                    <Home />
                </Router>
            );
        });

        await waitFor(() => {
            expect(
                screen.getByText(/Connect with Solana enthusiasts, share insights/i)
            ).toBeInTheDocument();
        });
    });
});




// Features Covered in Tests
// Basic Rendering:

// Ensures the static elements like headers and CTAs are rendered.
// User Data Fetching:

// Simulates successful fetch and ensures the user-specific welcome message is displayed.
// Error Handling:

// Tests error scenarios, including failed user fetch, and verifies appropriate error messages are displayed.
// Child Components:

// Verifies that key child components (NotificationBell, CryptoTicker, Feed, FeedFiltering) are rendered properly.
// Unauthenticated State:

// Ensures the appropriate welcome message is displayed for unauthenticated users.