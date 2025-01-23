import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import CryptoTicker from '../../components/CryptoTicker';

// Define the ecosystem coins to match the actual component
const solanaEcosystemCoins = [
    'solana',
    'jitosol',
    'jupiter',
    'pyth',
    'jito',
    'tensor',
    'bonk',
    'popcat',
];

jest.mock('axios');

describe('CryptoTicker Component', () => {
    const mockPrices = {
        solana: { usd: 22.34 },
        jitosol: { usd: 0.85 },
        jupiter: { usd: 1.2 },
        pyth: { usd: 5.12 },
        jito: { usd: 0.5 },
        tensor: { usd: 0.01 },
        bonk: { usd: 0.0001 },
        popcat: { usd: 0.1 },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the component and shows loading state', async () => {
        render(<CryptoTicker />);
        expect(screen.getByText('Solana Ecosystem Prices')).toBeInTheDocument();

        // Check that the loading state is shown
        await waitFor(() => {
            expect(screen.getByRole('alert', { name: /loading prices/i })).toBeInTheDocument();
        });
    });

    it('fetches and displays cryptocurrency prices', async () => {
        axios.get.mockResolvedValueOnce({ data: mockPrices });

        render(<CryptoTicker />);

        // Ensure prices are shown after data is fetched
        await waitFor(() => {
            solanaEcosystemCoins.forEach((coin) => {
                expect(screen.getByText(`${coin.toUpperCase()}: $`)).toBeInTheDocument();
            });
        });
    });

    it('displays an error message when fetching prices fails', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network Error'));

        render(<CryptoTicker />);

        // Wait for the error message to be displayed
        await waitFor(() => {
            expect(screen.getByRole('alert', { name: /failed to fetch prices/i })).toBeInTheDocument();
        });

        const retryButton = screen.getByRole('button', { name: /retry/i });
        expect(retryButton).toBeInTheDocument();

        // Simulate clicking retry
        fireEvent.click(retryButton);

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledTimes(2); // Retry the fetch
        });
    });

    it('filters the list of cryptocurrencies based on user input', async () => {
        axios.get.mockResolvedValueOnce({ data: mockPrices });

        render(<CryptoTicker />);

        // Wait for the first coin to be rendered
        await waitFor(() => {
            expect(screen.getByText('SOLANA:')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText(/search coins/i);

        fireEvent.change(searchInput, { target: { value: 'jito' } });

        // Wait for filtering effect
        await waitFor(() => {
            expect(screen.getByText('JITOSOL:')).toBeInTheDocument();
            expect(screen.queryByText('SOLANA:')).not.toBeInTheDocument();
        });
    });

    it('displays trend icons for increasing, decreasing, and unchanged prices', async () => {
        axios.get.mockResolvedValueOnce({ data: mockPrices });

        render(<CryptoTicker />);

        await waitFor(() => {
            expect(screen.getByText('⬆️')).toBeInTheDocument(); // Example for increasing prices
            expect(screen.getByText('⬇️')).toBeInTheDocument(); // Example for decreasing prices
            expect(screen.getByText('⏺️')).toBeInTheDocument(); // Example for unchanged prices
        });
    });

    it('refreshes prices when the refresh button is clicked', async () => {
        axios.get.mockResolvedValueOnce({ data: mockPrices });
        axios.get.mockResolvedValueOnce({
            data: {
                ...mockPrices,
                solana: { usd: 23.0 }, // Update price for refresh
            },
        });

        render(<CryptoTicker />);

        // Wait for the initial price
        await waitFor(() => {
            expect(screen.getByText('SOLANA: $22.34')).toBeInTheDocument();
        });

        const refreshButton = screen.getByRole('button', { name: /refresh cryptocurrency prices/i });
        fireEvent.click(refreshButton);

        // Wait for the price update after refresh
        await waitFor(() => {
            expect(screen.getByText('SOLANA: $23.00')).toBeInTheDocument();
        });
    });
});





// Test Scenarios Covered:
// Loading State: Ensures the spinner appears when prices are being fetched.
// Fetching and Displaying Prices: Verifies that prices are displayed after a successful API call.
// Error Handling: Tests the error message and retry functionality when fetching fails.
// Search Functionality: Tests filtering of cryptocurrencies based on user input.
// Trend Icons: Verifies the display of trend icons (⬆️ for up, ⬇️ for down, ⏺️ for unchanged).
// Refresh Button: Ensures the prices are refreshed when the button is clicked.
// Dependencies:
// The axios mock ensures API behavior is simulated without making real calls.
// waitFor ensures the test waits for asynchronous state changes.
