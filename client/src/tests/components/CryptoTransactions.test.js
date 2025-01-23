import React from 'react';
import { render, screen } from '@testing-library/react';
import CryptoTransaction from '../../components/CryptoTransactions';

describe('CryptoTransaction Component', () => {
    const mockTransaction = {
        type: 'buy',
        amount: 150.55,
        date: '2024-12-20T14:48:00.000Z',
    };

    it('renders the transaction details correctly', () => {
        render(<CryptoTransaction transaction={mockTransaction} />);

        // Check if type, amount, and date are displayed correctly
        expect(screen.getByText(/Type:/i)).toBeInTheDocument();
        expect(screen.getByText(/Buy/i)).toBeInTheDocument();
        expect(screen.getByText(/Amount:/i)).toBeInTheDocument();
        expect(screen.getByText(/150.55 SOL/i)).toBeInTheDocument();
        expect(screen.getByText(/Date:/i)).toBeInTheDocument();
        expect(screen.getByText(/12\/20\/2024/i)).toBeInTheDocument(); // Ensure consistent format
    });

    it('formats the transaction date correctly', () => {
        render(<CryptoTransaction transaction={mockTransaction} />);

        const dateElement = screen.getByText(/12\/20\/2024/i);
        expect(dateElement).toBeInTheDocument();
    });

    it('handles unknown transaction types gracefully', () => {
        const unknownTransaction = {
            type: 'unknown',
            amount: 0,
            date: 'Invalid Date',
        };
    
        render(<CryptoTransaction transaction={unknownTransaction} />);
    
        expect(screen.getByText(/Type:/i)).toBeInTheDocument();
        expect(screen.getByText(/Unknown/i)).toBeInTheDocument();
        expect(screen.getByText(/Amount:/i)).toBeInTheDocument();
        expect(screen.getByText(/0.00 SOL/i)).toBeInTheDocument(); // Change to match the format you return
        expect(screen.getByText(/Date:/i)).toBeInTheDocument();
        expect(screen.getByText(/Invalid Date/i)).toBeInTheDocument();
    });
    

    it('handles invalid date format gracefully', () => {
        const invalidDateTransaction = {
            type: 'sell',
            amount: 200.5,
            date: 'Invalid Date',
        };

        render(<CryptoTransaction transaction={invalidDateTransaction} />);

        expect(screen.getByText(/Invalid Date/i)).toBeInTheDocument();
    });

    it('handles null transaction gracefully', () => {
        render(<CryptoTransaction transaction={null} />);
    
        // Check if the component still renders with placeholders for unknown transaction data
        expect(screen.getByText(/Type:/i)).toBeInTheDocument();
        expect(screen.getByText(/Unknown/i)).toBeInTheDocument();
        expect(screen.getByText(/0.00 SOL/i)).toBeInTheDocument();
        expect(screen.getByText(/Invalid Date/i)).toBeInTheDocument();
    });
    
    it('handles undefined transaction gracefully', () => {
        render(<CryptoTransaction transaction={undefined} />);
    
        // Check if the component still renders with placeholders for unknown transaction data
        expect(screen.getByText(/Type:/i)).toBeInTheDocument();
        expect(screen.getByText(/Unknown/i)).toBeInTheDocument();
        expect(screen.getByText(/0.00 SOL/i)).toBeInTheDocument();
        expect(screen.getByText(/Invalid Date/i)).toBeInTheDocument();
    });
    
});
