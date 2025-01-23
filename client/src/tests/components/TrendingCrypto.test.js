import React from 'react';
import { render, screen, waitFor, fireEvent, cleanup, within } from '@testing-library/react';
import axios from 'axios';
import TrendingCrypto from '../../components/TrendingCrypto';

jest.mock('axios');
jest.mock('../../components/CryptoTicker', () => jest.fn(() => <div>Mock CryptoTicker</div>));
jest.mock('../../components/CryptoTrade', () => jest.fn(() => <div>Mock CryptoTrade</div>));
jest.mock('../../components/CryptoWalletIntegration', () => jest.fn(() => <div>Mock WalletWrapper</div>));
jest.mock('../../components/Loader', () => jest.fn(() => <div>Loading...</div>));

describe('TrendingCrypto Component', () => {
    const mockCoins = [
        {
            id: 'solana',
            name: 'Solana',
            symbol: 'sol',
            image: '/solana.png',
            current_price: 50.25,
        },
        {
            id: 'ethereum',
            name: 'Ethereum',
            symbol: 'eth',
            image: '/ethereum.png',
            current_price: 1800.5,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    afterEach(cleanup);

    it('renders loading state initially', async () => {
        render(<TrendingCrypto />);
        expect(screen.getByText(/loading.../i)).toBeInTheDocument();
    });

    it('renders coin data when API call succeeds', async () => {
        axios.get.mockResolvedValueOnce({ data: mockCoins });

        render(<TrendingCrypto />);

        await waitFor(() => expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument());

        const coinsList = screen.getByRole('list', { hidden: true }); // Use { hidden: true } for visibility edge cases
        expect(within(coinsList).getByText(/solana/i)).toBeInTheDocument();
        expect(within(coinsList).getByText(/ethereum/i)).toBeInTheDocument();
        expect(within(coinsList).getByText(/\$50.25/i)).toBeInTheDocument();
        expect(within(coinsList).getByText(/\$1800.50/i)).toBeInTheDocument();
    });

    it('renders an error message when API call fails', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network error'));

        render(<TrendingCrypto />);

        await waitFor(() =>
            expect(screen.getByText(/failed to fetch trending coins/i)).toBeInTheDocument()
        );

        expect(screen.getByText(/retry/i)).toBeInTheDocument();
    });

    it('retries fetching data on "Retry" button click', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network error'));
        axios.get.mockResolvedValueOnce({ data: mockCoins });

        render(<TrendingCrypto />);

        await waitFor(() =>
            expect(screen.getByText(/failed to fetch trending coins/i)).toBeInTheDocument()
        );

        const retryButton = screen.getByText(/retry/i);
        fireEvent.click(retryButton);

        await waitFor(() => expect(screen.getByText(/solana/i)).toBeInTheDocument());
    });

    it('renders no coins when API response is empty', async () => {
        axios.get.mockResolvedValueOnce({ data: [] });

        render(<TrendingCrypto />);

        await waitFor(() =>
            expect(screen.getByText(/no coins match your search/i)).toBeInTheDocument()
        );
    });

    it('filters coins based on search query', async () => {
        axios.get.mockResolvedValueOnce({ data: mockCoins });

        render(<TrendingCrypto />);

        await waitFor(() => expect(screen.getByText(/solana/i)).toBeInTheDocument());

        const searchInput = screen.getByPlaceholderText(/search coins/i);
        fireEvent.change(searchInput, { target: { value: 'eth' } });

        const coinsList = screen.getByRole('list', { hidden: true });
        expect(within(coinsList).queryByText(/solana/i)).not.toBeInTheDocument();
        expect(within(coinsList).getByText(/ethereum/i)).toBeInTheDocument();
    });

    it('refreshes coin prices on button click', async () => {
        axios.get
            .mockResolvedValueOnce({ data: mockCoins })
            .mockResolvedValueOnce({
                data: [
                    ...mockCoins,
                    {
                        id: 'bitcoin',
                        name: 'Bitcoin',
                        symbol: 'btc',
                        image: '/bitcoin.png',
                        current_price: 25000,
                    },
                ],
            });

        render(<TrendingCrypto />);

        await waitFor(() => expect(screen.getByText(/solana/i)).toBeInTheDocument());

        const refreshButton = screen.getByText(/refresh prices/i);
        fireEvent.click(refreshButton);

        await waitFor(() => expect(screen.getByText(/bitcoin/i)).toBeInTheDocument());
    });

    it('renders no data and handles no coins in localStorage', async () => {
        jest.spyOn(Storage.prototype, 'getItem').mockReturnValueOnce(null);

        render(<TrendingCrypto />);

        await waitFor(() => expect(screen.getByText(/loading.../i)).toBeInTheDocument());
    });
});


