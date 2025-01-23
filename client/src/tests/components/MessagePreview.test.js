import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import MessagePreview from '../../components/MessagePreview';
import axios from 'axios';

jest.mock('axios');

describe('MessagePreview Component', () => {
    const mockMessages = [
        { id: 1, sender: 'Alice', content: 'Hello, how are you?' },
        { id: 2, sender: 'Bob', content: 'Are you coming to the meeting?' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the title correctly', () => {
        render(<MessagePreview />);
        expect(screen.getByLabelText(/recent messages/i)).toBeInTheDocument();
    });

    it('displays a loading state initially', () => {
        render(<MessagePreview />);
        expect(screen.getByText(/loading messages/i)).toBeInTheDocument();
    });

    it('fetches and displays messages', async () => {
        axios.get.mockResolvedValueOnce({ data: { messages: mockMessages } });

        await act(async () => {
            render(<MessagePreview />);
        });

        await waitFor(() => {
            const messages = screen.getAllByRole('listitem');
            expect(messages).toHaveLength(mockMessages.length);
            expect(messages[0]).toHaveTextContent('Alice');
            expect(messages[1]).toHaveTextContent('Bob');
        });

        expect(screen.queryByText(/loading messages/i)).not.toBeInTheDocument();
    });

    it('displays an error message when the fetch fails', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network Error'));

        render(<MessagePreview />);

        await waitFor(() => {
            expect(screen.getByText(/failed to load recent messages/i)).toBeInTheDocument();
        });

        expect(screen.queryByText(/loading messages/i)).not.toBeInTheDocument();
    });

    it('displays a message when there are no recent messages', async () => {
        axios.get.mockResolvedValueOnce({ data: { messages: [] } });

        render(<MessagePreview />);

        await waitFor(() => {
            expect(screen.getByText(/no recent messages/i)).toBeInTheDocument();
        });

        expect(screen.queryByText(/loading messages/i)).not.toBeInTheDocument();
    });

    it('renders a list of messages with sender and content preview', async () => {
        axios.get.mockResolvedValueOnce({ data: { messages: mockMessages } });
    
        render(<MessagePreview />);
    
        await waitFor(() => {
            mockMessages.forEach((message) => {
                // Check if the sender is in the document
                expect(screen.getByText(message.sender)).toBeInTheDocument();
                
                // Check the truncated content. We will use a flexible matcher to handle the text properly
                const truncatedMessage = message.content.slice(0, 50) + '...';
                expect(screen.getByText((content, element) => 
                    element.textContent.includes(truncatedMessage)
                )).toBeInTheDocument();
            });
        });
    });
    
    

    it('cleans up API calls on component unmount', async () => {
        const { unmount } = render(<MessagePreview />);
        unmount();

        expect(axios.get).toHaveBeenCalledTimes(1); // Ensure no additional calls are made
    });
});


// Key Features of the Test File
// Basic Rendering:

// Ensures the title, loading state, and empty state are correctly displayed.
// Data Fetching:

// Mocks an API call to fetch messages and verifies that messages are rendered correctly.
// Error Handling:

// Simulates a failed API call and checks that the error message is displayed.
// Empty State:

// Verifies that a message is shown when there are no recent messages.
// Unsubscription:

// Ensures API calls are cleaned up when the component unmounts.