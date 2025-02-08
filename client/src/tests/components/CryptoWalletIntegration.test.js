import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import CryptoWalletIntegration from '../../components/Crypto_components/CryptoWalletIntegration';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';

// Mock dependencies
jest.mock('@solana/wallet-adapter-react', () => ({
    ...jest.requireActual('@solana/wallet-adapter-react'),
    useWallet: jest.fn(),
}));

jest.mock('@solana/web3.js', () => ({
    ...jest.requireActual('@solana/web3.js'),
    Connection: jest.fn().mockImplementation(() => ({
        getBalance: jest.fn(),
        confirmTransaction: jest.fn(),
    })),
    PublicKey: jest.fn().mockImplementation(() => ({
        toBase58: jest.fn(() => 'mock-public-key'),
    })),
    SystemProgram: {
        transfer: jest.fn(),
    },
    Transaction: jest.fn().mockImplementation(() => ({
        add: jest.fn(),
    })),
}));

describe('CryptoWalletIntegration', () => {
    const mockWallet = {
        connected: true,
        publicKey: new PublicKey('mock-public-key'),
        sendTransaction: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        useWallet.mockReturnValue(mockWallet);
    });

    it('renders wallet balance and input fields', async () => {
        // Mock getBalance to resolve with a value
        Connection.mockImplementationOnce(() => ({
            getBalance: jest.fn().mockResolvedValue(1000000000), // 1 SOL
        }));

        render(<CryptoWalletIntegration />);

        await waitFor(() => {
            expect(screen.getByText(/Balance:/)).toBeInTheDocument();
            expect(screen.getByText(/1.00 SOL/)).toBeInTheDocument();
        });

        expect(screen.getByPlaceholderText(/Recipient Wallet Address/)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Amount \(SOL\)/)).toBeInTheDocument();
    });

    it('shows error if recipient address is invalid', async () => {
        const invalidRecipient = 'invalid-address';

        render(<CryptoWalletIntegration />);

        fireEvent.change(screen.getByPlaceholderText(/Recipient Wallet Address/), {
            target: { value: invalidRecipient },
        });
        fireEvent.change(screen.getByPlaceholderText(/Amount \(SOL\)/), {
            target: { value: '0.5' },
        });
        fireEvent.click(screen.getByText(/Send/));

        await waitFor(() => {
            expect(screen.getByText(/Invalid recipient address/)).toBeInTheDocument();
        });
    });

    it('shows error if balance is insufficient', async () => {
        Connection.mockImplementationOnce(() => ({
            getBalance: jest.fn().mockResolvedValue(100000000), // 0.1 SOL
        }));

        render(<CryptoWalletIntegration />);

        fireEvent.change(screen.getByPlaceholderText(/Recipient Wallet Address/), {
            target: { value: 'valid-address' },
        });
        fireEvent.change(screen.getByPlaceholderText(/Amount \(SOL\)/), {
            target: { value: '0.5' },
        });
        fireEvent.click(screen.getByText(/Send/));

        await waitFor(() => {
            expect(screen.getByText(/Insufficient balance/)).toBeInTheDocument();
        });
    });

    it('handles successful transaction', async () => {
        Connection.mockImplementationOnce(() => ({
            getBalance: jest.fn().mockResolvedValue(2000000000), // 2 SOL
            confirmTransaction: jest.fn().mockResolvedValue(true),
        }));

        mockWallet.sendTransaction.mockResolvedValue('mock-signature');

        render(<CryptoWalletIntegration />);

        fireEvent.change(screen.getByPlaceholderText(/Recipient Wallet Address/), {
            target: { value: 'valid-public-key' },
        });
        fireEvent.change(screen.getByPlaceholderText(/Amount \(SOL\)/), {
            target: { value: '0.5' },
        });
        fireEvent.click(screen.getByText(/Send/));

        await waitFor(() => {
            expect(screen.getByText(/Transaction successful!/)).toBeInTheDocument();
            expect(screen.getByText(/View on Explorer/)).toBeInTheDocument();
        });
    });

    it('handles transaction failure', async () => {
        Connection.mockImplementationOnce(() => ({
            getBalance: jest.fn().mockResolvedValue(2000000000), // 2 SOL
        }));

        mockWallet.sendTransaction.mockRejectedValue(new Error('Transaction failed'));

        render(<CryptoWalletIntegration />);

        fireEvent.change(screen.getByPlaceholderText(/Recipient Wallet Address/), {
            target: { value: 'valid-public-key' },
        });
        fireEvent.change(screen.getByPlaceholderText(/Amount \(SOL\)/), {
            target: { value: '0.5' },
        });
        fireEvent.click(screen.getByText(/Send/));

        await waitFor(() => {
            expect(screen.getByText(/Transaction failed/)).toBeInTheDocument();
        });
    });

    it('handles loading state during transaction processing', async () => {
        Connection.mockImplementationOnce(() => ({
            getBalance: jest.fn().mockResolvedValue(2000000000), // 2 SOL
        }));

        mockWallet.sendTransaction.mockResolvedValue('mock-signature');

        render(<CryptoWalletIntegration />);

        fireEvent.change(screen.getByPlaceholderText(/Recipient Wallet Address/), {
            target: { value: 'valid-public-key' },
        });
        fireEvent.change(screen.getByPlaceholderText(/Amount \(SOL\)/), {
            target: { value: '0.5' },
        });
        fireEvent.click(screen.getByText(/Send/));

        expect(screen.getByText(/Processing.../)).toBeInTheDocument(); // Check for the loading text

        await waitFor(() => {
            expect(screen.getByText(/Transaction successful!/)).toBeInTheDocument();
        });
    });
});