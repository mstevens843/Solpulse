import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CryptoTip from '../../components/CryptoTip';

describe('CryptoTip Component', () => {
    const mockOnTip = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the CryptoTip component with inputs and buttons', () => {
        render(<CryptoTip recipientId={123} onTip={mockOnTip} />);

        expect(screen.getByPlaceholderText('Tip amount (SOL)')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Add a message (optional)')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /send tip/i })).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: /tip \d+(\.\d+)? sol/i })).toHaveLength(3); // Preset buttons
    });

    it('allows users to type a tip amount and message', () => {
        render(<CryptoTip recipientId={123} onTip={mockOnTip} />);

        const tipInput = screen.getByPlaceholderText('Tip amount (SOL)');
        const messageInput = screen.getByPlaceholderText('Add a message (optional)');

        fireEvent.change(tipInput, { target: { value: '0.5' } });
        fireEvent.change(messageInput, { target: { value: 'Thanks for your work!' } });

        expect(tipInput).toHaveValue(0.5); // Expecting number, not string
        expect(messageInput).toHaveValue('Thanks for your work!');
    });

    it('displays an error message for invalid tip amounts', () => {
        render(<CryptoTip recipientId={123} onTip={mockOnTip} />);

        const submitButton = screen.getByRole('button', { name: /send tip/i });
        const tipInput = screen.getByPlaceholderText('Tip amount (SOL)');

        fireEvent.change(tipInput, { target: { value: '-1' } });
        fireEvent.click(submitButton);

        expect(screen.getByText(/please enter a valid tip amount/i)).toBeInTheDocument();
        expect(mockOnTip).not.toHaveBeenCalled();
    });

    it('calls onTip when valid data is submitted', async () => {
        render(<CryptoTip recipientId={123} onTip={mockOnTip} />);

        const tipInput = screen.getByPlaceholderText('Tip amount (SOL)');
        const messageInput = screen.getByPlaceholderText('Add a message (optional)');
        const submitButton = screen.getByRole('button', { name: /send tip/i });

        fireEvent.change(tipInput, { target: { value: '1.0' } });
        fireEvent.change(messageInput, { target: { value: 'Great job!' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnTip).toHaveBeenCalledWith({
                toUserId: 123,
                amount: 1.0,
                message: 'Great job!',
            });
        });
    });

    it('displays success and clears inputs after successful tip', async () => {
        render(<CryptoTip recipientId={123} onTip={mockOnTip} />);

        const tipInput = screen.getByPlaceholderText('Tip amount (SOL)');
        const messageInput = screen.getByPlaceholderText('Add a message (optional)');
        const submitButton = screen.getByRole('button', { name: /send tip/i });

        fireEvent.change(tipInput, { target: { value: '1.0' } });
        fireEvent.change(messageInput, { target: { value: 'Great job!' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/successfully sent/i)).toBeInTheDocument();
        });

        // Ensure the inputs are cleared after success
        expect(tipInput).toHaveValue(null); // Check if the input is cleared
        expect(messageInput).toHaveValue('');
    });

    it('displays an error message when onTip fails', async () => {
        mockOnTip.mockRejectedValueOnce(new Error('Tip failed'));

        render(<CryptoTip recipientId={123} onTip={mockOnTip} />);

        const tipInput = screen.getByPlaceholderText('Tip amount (SOL)');
        const submitButton = screen.getByRole('button', { name: /send tip/i });

        fireEvent.change(tipInput, { target: { value: '1.0' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/failed to send the tip/i)).toBeInTheDocument();
        });

        expect(mockOnTip).toHaveBeenCalled();
    });

    it('sets a preset tip amount when preset button is clicked', () => {
        render(<CryptoTip recipientId={123} onTip={mockOnTip} />);

        const presetButton = screen.getByRole('button', { name: /tip 0\.5 sol/i });
        const tipInput = screen.getByPlaceholderText('Tip amount (SOL)');

        fireEvent.click(presetButton);

        expect(tipInput).toHaveValue(0.5); // Expecting number, not string
    });
});




// Test Scenarios Covered:
// Component Render: Ensures the inputs and buttons render correctly.
// User Input: Tests the ability to type a tip amount and optional message.
// Error Handling: Validates errors for invalid amounts and API failures.
// Success Flow: Verifies success behavior, including clearing inputs and showing messages.
// Preset Button: Confirms preset buttons set predefined amounts.