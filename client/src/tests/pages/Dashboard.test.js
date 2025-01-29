import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import Dashboard from '../../Archive/Dashboard';

jest.mock('axios');
jest.mock('../../components/CryptoWalletIntegration', () => jest.fn(() => <div>Mock CryptoWalletIntegration</div>));
jest.mock('../../components/CryptoTransactions', () => jest.fn(() => <div>Mock CryptoTransactions</div>));
jest.mock('../../components/Feed', () => jest.fn(() => <div>Mock Feed</div>));
jest.mock('../../components/NotificationBell', () => jest.fn(() => <div>Mock NotificationBell</div>));
jest.mock('../../components/TrendingCrypto', () => jest.fn(() => <div>Mock TrendingCrypto</div>));
jest.mock('../../components/MessagePreview', () => jest.fn(() => <div>Mock MessagePreview</div>));
jest.mock('../../components/FollowButton', () => jest.fn(() => <button>Mock Follow Button</button>));

describe('Dashboard Component', () => {
    const mockUser = {
        id: 1,
        username: 'testuser',
    };

    const mockTransactions = [
        { id: 1, type: 'buy', amount: 10, date: '2023-12-01T10:00:00Z' },
        { id: 2, type: 'sell', amount: 5, date: '2023-12-02T12:00:00Z' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state initially', () => {
        render(<Dashboard />);
        expect(screen.getByText(/loading dashboard/i)).toBeInTheDocument();
    });

    it('renders user data and components when data is fetched successfully', async () => {
        axios.get
            .mockResolvedValueOnce({ data: mockUser }) // Mock user API response
            .mockResolvedValueOnce({ data: { transactions: mockTransactions } }); // Mock transactions API response
    
        // Wrap render in `act` to handle state updates
        await act(async () => {
            render(<Dashboard />);
        });
    
        // Wait for the loading state to disappear
        await waitFor(() => expect(screen.queryByText(/loading dashboard/i)).not.toBeInTheDocument());
    
        // Check user data and header
        expect(screen.getByText(/welcome, testuser!/i)).toBeInTheDocument();
    
        // Check mocked child components with flexible matchers
        expect(screen.getByText((content) => content.includes('Mock CryptoWalletIntegration'))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes('Mock CryptoTransactions'))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes('Mock Feed'))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes('Mock NotificationBell'))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes('Mock TrendingCrypto'))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes('Mock MessagePreview'))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes('Mock Follow Button'))).toBeInTheDocument();
    });

    it('renders an error message when fetching data fails', async () => {
        axios.get.mockRejectedValue(new Error('Network error'));

        await act(async () => {
            render(<Dashboard />);
        });

        // Wait for the error message to appear
        await waitFor(() => expect(screen.getByText(/failed to load dashboard data/i)).toBeInTheDocument());

        // Ensure loading message is gone
        expect(screen.queryByText(/loading dashboard/i)).not.toBeInTheDocument();

        // Ensure no child components are rendered
        expect(screen.queryByText(/mock cryptowalletintegration/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/mock cryptotransactions/i)).not.toBeInTheDocument();
    });

    it('does not render components if user data is unavailable', async () => {
        axios.get
            .mockResolvedValueOnce({ data: null }) // User API
            .mockResolvedValueOnce({ data: { transactions: [] } }); // Transactions API

        await act(async () => {
            render(<Dashboard />);
        });

        // Wait for the fetch to complete
        await waitFor(() => expect(screen.queryByText(/loading dashboard/i)).not.toBeInTheDocument());

        // Ensure no user data is displayed
        expect(screen.queryByText(/welcome/i)).not.toBeInTheDocument();

        // Ensure child components are not rendered
        expect(screen.queryByText(/mock cryptowalletintegration/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/mock cryptotransactions/i)).not.toBeInTheDocument();
    });
});


// Features Covered in Tests
// Initial State:

// Verifies that the loading message is displayed initially.
// Successful Data Fetch:

// Ensures user data is rendered when the API calls are successful.
// Confirms that all child components (CryptoWalletIntegration, CryptoTransactions, etc.) are rendered.
// Error Handling:

// Displays an error message when API calls fail.
// Ensures loading state is removed after failure.
// Fallback for Missing Data:

// Verifies that components relying on user data are not rendered if the user data is unavailable.
// Mocking Child Components:

// Mocks all child components to isolate the testing scope for the Dashboard component.