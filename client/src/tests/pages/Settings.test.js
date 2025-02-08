import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import Settings from '../../pages/Settings';

// Mock the axios calls to avoid real network requests
jest.mock('axios');

// Mocked Settings data
const mockSettings = {
    email: 'user@example.com',
    privacy: 'public',
    walletAddress: 'abcd1234efgh5678',
};

describe('Settings Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loader while fetching settings', async () => {
        axios.get.mockResolvedValueOnce({ data: mockSettings });

        render(<Settings />);
        // Verify that the loader is displayed
        expect(screen.getByRole('status')).toBeInTheDocument();

        // Wait for settings to load
        await waitFor(() => {
            expect(screen.queryByRole('status')).not.toBeInTheDocument(); // Ensure loader disappears once data is fetched
        });
    });

    it('displays settings fetched from the API', async () => {
        axios.get.mockResolvedValueOnce({ data: mockSettings });

        render(<Settings />);

        // Wait for inputs to populate with the mock data
        await waitFor(() => {
            expect(screen.getByDisplayValue(mockSettings.email)).toBeInTheDocument();
            expect(screen.getByDisplayValue(mockSettings.privacy)).toBeInTheDocument();
            expect(screen.getByDisplayValue(mockSettings.walletAddress)).toBeInTheDocument();
        });
    });

    it('handles API errors when fetching settings', async () => {
        axios.get.mockRejectedValueOnce(new Error('Failed to fetch settings'));

        render(<Settings />);

        // Verify the error message is shown when the API call fails
        await waitFor(() => {
            expect(screen.getByText('Failed to load settings. Please try again.')).toBeInTheDocument();
        });
    });

    it('validates email format and displays an error for invalid email', async () => {
        axios.get.mockResolvedValueOnce({ data: mockSettings });

        render(<Settings />);

        await waitFor(() => screen.getByDisplayValue(mockSettings.email));

        const emailInput = screen.getByLabelText('Email:');
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

        const saveButton = screen.getByText('Save Settings');
        fireEvent.click(saveButton);

        expect(screen.getByText('Invalid email format.')).toBeInTheDocument();
    });

    it('validates password length and displays an error for short password', async () => {
        axios.get.mockResolvedValueOnce({ data: mockSettings });

        render(<Settings />);

        await waitFor(() => screen.getByDisplayValue(mockSettings.email));

        const passwordInput = screen.getByLabelText('Password:');
        fireEvent.change(passwordInput, { target: { value: '123' } });

        const saveButton = screen.getByText('Save Settings');
        fireEvent.click(saveButton);

        expect(screen.getByText('Password must be at least 6 characters long.')).toBeInTheDocument();
    });

    it('handles successful settings update', async () => {
        axios.get.mockResolvedValueOnce({ data: mockSettings });
        axios.put.mockResolvedValueOnce({ data: { success: true } });

        render(<Settings />);

        await waitFor(() => screen.getByDisplayValue(mockSettings.email));

        const emailInput = screen.getByLabelText('Email:');
        fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });

        const saveButton = screen.getByText('Save Settings');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('Settings updated successfully!')).toBeInTheDocument();
        });
    });

    it('handles API errors when updating settings', async () => {
        axios.get.mockResolvedValueOnce({ data: mockSettings });
        axios.put.mockRejectedValueOnce(new Error('Failed to update settings'));

        render(<Settings />);

        await waitFor(() => screen.getByDisplayValue(mockSettings.email));

        const emailInput = screen.getByLabelText('Email:');
        fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });

        const saveButton = screen.getByText('Save Settings');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('Failed to update settings. Please try again.')).toBeInTheDocument();
        });
    });

    it('handles wallet address validation', async () => {
        axios.get.mockResolvedValueOnce({ data: mockSettings });

        render(<Settings />);

        await waitFor(() => screen.getByDisplayValue(mockSettings.walletAddress));

        const walletInput = screen.getByLabelText('Wallet Address:');
        fireEvent.change(walletInput, { target: { value: 'short' } });

        const saveButton = screen.getByText('Save Settings');
        fireEvent.click(saveButton);

        expect(screen.getByText('Wallet address is too short.')).toBeInTheDocument();
    });

    it('renders additional sections correctly', async () => {
        axios.get.mockResolvedValueOnce({ data: mockSettings });

        render(<Settings />);

        // Ensure sections like Crypto Wallet are rendered properly
        await waitFor(() => {
            expect(screen.getByText('Your Crypto Wallet')).toBeInTheDocument();
            expect(screen.getByText('Account Settings')).toBeInTheDocument();
        });
    });
});