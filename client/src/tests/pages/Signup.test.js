import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Signup from '../../pages/Signup';

jest.mock('axios');
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));

const mockNavigate = jest.fn();

describe('Signup Page', () => {
    beforeEach(() => {
        jest.mocked(useNavigate).mockReturnValue(mockNavigate);
        jest.clearAllMocks();
    });

    it('renders the signup form', () => {
        render(
            <MemoryRouter>
                <Signup />
            </MemoryRouter>
        );

        expect(screen.getByLabelText('Username')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
    });

    it('validates required fields and displays errors', async () => {
        render(
            <MemoryRouter>
                <Signup />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

        await waitFor(() => {
            expect(screen.getByText('Username is required.')).toBeInTheDocument();
            expect(screen.getByText('Invalid email format.')).toBeInTheDocument();
            expect(screen.getByText('Password must be at least 6 characters long.')).toBeInTheDocument();
        });
    });

    it('shows error if passwords do not match', async () => {
        render(
            <MemoryRouter>
                <Signup />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'different123' } });

        fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

        await waitFor(() => {
            expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
        });
    });

    it('handles successful signup', async () => {
        axios.post.mockResolvedValueOnce({ data: { success: true } });

        await act(async () => {
            render(
                <MemoryRouter>
                    <Signup />
                </MemoryRouter>
            );
        });

        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'newuser' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));
        });

        await waitFor(() => {
            expect(screen.getByText('Signup successful! Redirecting...')).toBeInTheDocument();
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    it('handles server errors gracefully', async () => {
        axios.post.mockRejectedValueOnce({ response: { data: { message: 'Email already in use.' } } });

        await act(async () => {
            render(
                <MemoryRouter>
                    <Signup />
                </MemoryRouter>
            );
        });

        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'newuser' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));
        });

        await waitFor(() => {
            expect(screen.getByText('Email already in use.')).toBeInTheDocument();
        });
    });

    it('shows loading spinner during signup', async () => {
        axios.post.mockResolvedValueOnce({ data: { success: true } });

        await act(async () => {
            render(
                <MemoryRouter>
                    <Signup />
                </MemoryRouter>
            );
        });

        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'newuser' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Sign Up/i })).toHaveAttribute('aria-busy', 'true');
            expect(screen.getByText(/Loading/i)).toBeInTheDocument();
        });
    });
});