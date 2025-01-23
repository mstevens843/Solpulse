import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { MemoryRouter } from 'react-router-dom';
import Messages from '../../pages/Messages';

jest.mock('axios');

describe('Messages Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockMessages = [
        { id: 1, sender: 'Alice', content: 'Hello!', read: false },
        { id: 2, sender: 'Bob', content: 'How are you?', read: true },
    ];

    const mockPaginatedResponse = {
        messages: mockMessages,
        totalPages: 2,
        currentPage: 1,
    };

    const renderWithProviders = (ui) => {
        return render(
            <WalletProvider wallets={[]} autoConnect>
                <MemoryRouter>{ui}</MemoryRouter>
            </WalletProvider>
        );
    };

    it('renders the page correctly', () => {
        renderWithProviders(<Messages />);

        expect(screen.getByText(/messages/i)).toBeInTheDocument();
        expect(screen.getByText(/send a new message/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/recipient username/i)).toBeInTheDocument();
    });

    it('fetches and displays messages on load', async () => {
        axios.get.mockResolvedValueOnce({ data: mockPaginatedResponse });

        renderWithProviders(<Messages />);

        expect(screen.getByText(/loading/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Alice: Hello!')).toBeInTheDocument();
            expect(screen.getByText('Bob: How are you?')).toBeInTheDocument();
        });

        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    it('handles API errors gracefully when fetching messages', async () => {
        axios.get.mockRejectedValueOnce(new Error('Failed to fetch'));

        renderWithProviders(<Messages />);

        await waitFor(() => {
            expect(screen.getByText(/failed to load messages/i)).toBeInTheDocument();
        });
    });

    it('marks a message as read when clicked', async () => {
        axios.get.mockResolvedValueOnce({ data: mockPaginatedResponse });
        axios.patch.mockResolvedValueOnce({});

        renderWithProviders(<Messages />);

        await waitFor(() => {
            const message = screen.getByText('Alice: Hello!');
            fireEvent.click(message);
        });

        expect(axios.patch).toHaveBeenCalledWith(
            expect.stringContaining('/messages/1/read')
        );
    });

    it('handles errors when marking messages as read', async () => {
        axios.get.mockResolvedValueOnce({ data: mockPaginatedResponse });
        axios.patch.mockRejectedValueOnce(new Error('Failed to mark as read'));

        renderWithProviders(<Messages />);

        await waitFor(() => {
            const message = screen.getByText('Alice: Hello!');
            fireEvent.click(message);
        });

        expect(axios.patch).toHaveBeenCalledWith(
            expect.stringContaining('/messages/1/read')
        );
        expect(screen.getByText('Alice: Hello!')).toBeInTheDocument(); // Ensure message remains unread
    });

    it('sends a new message successfully', async () => {
        axios.post.mockResolvedValueOnce({ data: { id: 3, sender: 'Me', content: 'New Message', read: false } });
        axios.get.mockResolvedValueOnce({ data: mockPaginatedResponse });

        renderWithProviders(<Messages />);

        fireEvent.change(screen.getByLabelText(/recipient username/i), {
            target: { value: 'Charlie' },
        });
        fireEvent.change(screen.getByPlaceholderText(/type your message/i), {
            target: { value: 'New Message' },
        });
        fireEvent.click(screen.getByRole('button', { name: /send message/i }));

        await waitFor(() => {
            expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
        });

        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/messages'),
            expect.objectContaining({
                recipient: 'Charlie',
                message: 'New Message',
            })
        );
    });

    it('handles errors when sending a new message', async () => {
        axios.post.mockRejectedValueOnce(new Error('Failed to send message'));

        renderWithProviders(<Messages />);

        fireEvent.change(screen.getByLabelText(/recipient username/i), {
            target: { value: 'Charlie' },
        });
        fireEvent.change(screen.getByPlaceholderText(/type your message/i), {
            target: { value: 'New Message' },
        });
        fireEvent.click(screen.getByRole('button', { name: /send message/i }));

        await waitFor(() => {
            expect(screen.getByText(/failed to send message/i)).toBeInTheDocument();
        });
    });

    it('displays pagination buttons and handles page changes', async () => {
        axios.get.mockResolvedValueOnce({ data: mockPaginatedResponse });

        renderWithProviders(<Messages />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /next/i }));

        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining('/messages?page=2')
        );
    });

    it('handles edge cases for pagination', async () => {
        axios.get.mockResolvedValueOnce({ data: { messages: mockMessages, totalPages: 1, currentPage: 1 } });

        renderWithProviders(<Messages />);

        await waitFor(() => {
            expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
        });
    });
});




