import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Notifications from '../../pages/Archive/Notifications';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('Notifications Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockNotifications = {
        notifications: [
            { id: 1, content: 'You have a new follower!', isRead: false, type: 'follow', createdAt: '2024-12-20T10:00:00Z' },
            { id: 2, content: 'Your post was liked.', isRead: true, type: 'like', createdAt: '2024-12-19T12:00:00Z' },
        ],
        unreadCount: 1,
        totalPages: 1,
    };

    it('renders the notifications page correctly', async () => {
        axios.get.mockResolvedValueOnce({ data: mockNotifications });

        render(<Notifications />);

        // Verify header is present
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Notifications');

        // Verify loading state (loader component presence)
        expect(screen.getByRole('status')).toBeInTheDocument();

        // Wait for data to load
        await waitFor(() => {
            expect(screen.getByText('You have a new follower!')).toBeInTheDocument();
            expect(screen.getByText('Your post was liked.')).toBeInTheDocument();
        });
    });

    it('filters notifications by type', async () => {
        axios.get.mockResolvedValueOnce({ data: mockNotifications });

        render(<Notifications />);

        // Wait for data to load
        await waitFor(() => screen.getByText('You have a new follower!'));

        // Select "Likes" filter
        fireEvent.change(screen.getByLabelText(/filter by type/i), { target: { value: 'like' } });

        // Verify filtered results
        expect(screen.queryByText('You have a new follower!')).not.toBeInTheDocument();
        expect(screen.getByText('Your post was liked.')).toBeInTheDocument();
    });

    it('marks all notifications as read', async () => {
        axios.get.mockResolvedValueOnce({ data: mockNotifications });
        axios.post.mockResolvedValueOnce();  // Mock the post request for marking as read
    
        render(<Notifications />);
    
        // Wait for data to load
        await waitFor(() => screen.getByText('You have a new follower!'));
    
        // Click "Mark All as Read"
        fireEvent.click(screen.getByText(/mark all as read/i));
    
        // Wait for state update (to see the notification marked as read)
        await waitFor(() => {
            // Verify that the notification has the 'read' class applied
            const notification = screen.getByText('You have a new follower!');
            expect(notification.closest('.notification-item')).toHaveClass('read');
        });
    });

    it('handles pagination buttons correctly', async () => {
        const paginatedNotifications = {
            ...mockNotifications,
            totalPages: 2,
        };
        axios.get.mockResolvedValueOnce({ data: paginatedNotifications });

        render(<Notifications />);

        // Wait for data to load
        await waitFor(() => screen.getByText('You have a new follower!'));

        // Click page 2
        fireEvent.click(screen.getByText('2'));

        // Verify fetch for page 2
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('page=2'));
        });
    });

    it('displays an error message on fetch failure', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network Error'));

        render(<Notifications />);

        // Wait for error message
        await waitFor(() => {
            expect(screen.getByText(/failed to fetch notifications/i)).toBeInTheDocument();
        });
    });

    it('displays an empty state when no notifications are available', async () => {
        axios.get.mockResolvedValueOnce({ data: { notifications: [], unreadCount: 0, totalPages: 0 } });

        render(<Notifications />);

        // Verify no notifications message
        await waitFor(() => {
            expect(screen.getByText('No new notifications.')).toBeInTheDocument();
        });
    });
});