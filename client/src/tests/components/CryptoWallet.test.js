import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import CryptoWallet from '../../components/Crypto_components/CryptoWallet';
import { act } from 'react';  // Ensure you import from 'react' for act
import MockAdapter from 'axios-mock-adapter';

// Mock Axios
const mockAxios = new MockAdapter(axios);

describe('CryptoWallet Component', () => {
    const mockWallets = [
        { id: 1, address: 'wallet1', balance: 100 },
        { id: 2, address: 'wallet2', balance: 200 },
    ];

    const mockTransactions = [
        { id: 1, type: 'sent', amount: 50, date: '2024-12-20T14:48:00.000Z' },
        { id: 2, type: 'received', amount: 75, date: '2024-12-21T14:48:00.000Z' },
    ];

    beforeEach(() => {
        mockAxios.reset();
        // Mock the API response before each test
        mockAxios.onGet(`${process.env.REACT_APP_API_URL}/wallet`).reply(200, { wallets: mockWallets });
        mockAxios
            .onGet(`${process.env.REACT_APP_API_URL}/transactions/wallet/wallet1`)
            .reply(200, { transactions: [mockTransactions[0]] });
        mockAxios
            .onGet(`${process.env.REACT_APP_API_URL}/transactions/wallet/wallet2`)
            .reply(200, { transactions: [mockTransactions[1]] });
    });

    it('renders the loading state initially', () => {
        render(<CryptoWallet />);
        expect(screen.getByText(/Loading.../i)).toBeInTheDocument();  // Ensure "Loading..." is visible when loading
    });

    it('fetches and displays wallets and transactions', async () => {
        await act(async () => {
            render(<CryptoWallet />);
        });

        // Expect the total balance to be displayed correctly after data fetch
        expect(await screen.findByText(/Total Balance:/i)).toBeInTheDocument();
        expect(screen.getByText(/300.00 SOL/i)).toBeInTheDocument();

        // Check if wallets are rendered
        expect(screen.getByText(/wallet1/i)).toBeInTheDocument();
        expect(screen.getByText(/wallet2/i)).toBeInTheDocument();

        // Check if transactions are rendered
        expect(screen.getByText(/50.00 SOL/i)).toBeInTheDocument();
        expect(screen.getByText(/75.00 SOL/i)).toBeInTheDocument();
    });

    it('displays an error message if fetching wallets fails', async () => {
        // Simulate a failed API request
        mockAxios.onGet(`${process.env.REACT_APP_API_URL}/wallet`).reply(500);

        await act(async () => {
            render(<CryptoWallet />);
        });

        expect(await screen.findByText(/Failed to load wallet data/i)).toBeInTheDocument();
    });

    it('filters transactions by type', async () => {
        await act(async () => {
            render(<CryptoWallet />);
        });

        // Verify both transactions are displayed initially
        expect(await screen.findByText(/50.00 SOL/i)).toBeInTheDocument();
        expect(screen.getByText(/75.00 SOL/i)).toBeInTheDocument();

        // Change the filter to "sent"
        fireEvent.change(screen.getByLabelText(/Filter transactions by type/i), {
            target: { value: 'sent' },
        });

        // Verify that the "sent" transaction is displayed and "received" is hidden
        expect(screen.getByText(/50.00 SOL/i)).toBeInTheDocument();
        expect(screen.queryByText(/75.00 SOL/i)).not.toBeInTheDocument();
    });

    it('sorts transactions by date', async () => {
        await act(async () => {
            render(<CryptoWallet />);
        });

        // Default sort is latest first
        const transactionDates = screen.getAllByText(/2024-12/i);
        expect(transactionDates[0].textContent).toContain('12/21/2024');
        expect(transactionDates[1].textContent).toContain('12/20/2024');

        // Change sort order to oldest first
        fireEvent.change(screen.getByLabelText(/Sort transactions/i), {
            target: { value: 'oldest' },
        });

        const sortedDates = screen.getAllByText(/2024-12/i);
        expect(sortedDates[0].textContent).toContain('12/20/2024');
        expect(sortedDates[1].textContent).toContain('12/21/2024');
    });
});