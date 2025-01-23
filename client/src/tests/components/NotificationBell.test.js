import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationBell from '../../components/NotificationBell';
import axios from 'axios';

// Mock the axios module
jest.mock('axios');

describe('NotificationBell Component', () => {
    const mockNotifications = [
        { id: 1, message: 'New message from Alice', createdAt: '2024-12-20T10:00:00Z', read: false },
        { id: 2, message: 'Your post received a like', createdAt: '2024-12-19T14:30:00Z', read: true },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the bell icon and displays unread count', async () => {
        axios.get.mockResolvedValue({
            data: { notifications: mockNotifications, unreadCount: 1 },
        });

        render(<NotificationBell />);

        // Check if the bell icon is rendered with the correct unread count
        expect(screen.getByLabelText(/notifications \(1 unread\)/i)).toBeInTheDocument();

        // Ensure the notifications are loaded
        await waitFor(() => {
            expect(screen.getByText('New message from Alice')).toBeInTheDocument();
        });
    });

    it('toggles the dropdown when the bell icon is clicked', async () => {
        axios.get.mockResolvedValue({
            data: { notifications: mockNotifications, unreadCount: 1 },
        });

        render(<NotificationBell />);

        const bellButton = screen.getByLabelText(/notifications \(1 unread\)/i);

        // Open dropdown
        fireEvent.click(bellButton);
        expect(screen.getByText('Notifications')).toBeInTheDocument();

        // Close dropdown
        fireEvent.click(bellButton);
        await waitFor(() => {
            expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
        });
    });

    it('marks all notifications as read', async () => {
        axios.get.mockResolvedValue({
            data: { notifications: mockNotifications, unreadCount: 1 },
        });
        axios.post.mockResolvedValue({});

        render(<NotificationBell />);

        // Open dropdown
        fireEvent.click(screen.getByLabelText(/notifications \(1 unread\)/i));
        expect(screen.getByText('Notifications')).toBeInTheDocument();

        // Mark all as read
        fireEvent.click(screen.getByLabelText(/mark all notifications as read/i));
        await waitFor(() => {
            expect(screen.queryByText(/1 unread/i)).not.toBeInTheDocument();
        });
    });

    it('displays "No notifications" when there are no notifications', async () => {
        axios.get.mockResolvedValue({
            data: { notifications: [], unreadCount: 0 },
        });

        render(<NotificationBell />);

        // Open dropdown
        fireEvent.click(screen.getByLabelText(/notifications \(0 unread\)/i));
        await waitFor(() => {
            expect(screen.getByText(/no notifications/i)).toBeInTheDocument();
        });
    });

    it('handles API errors gracefully', async () => {
        axios.get.mockRejectedValue(new Error('Failed to fetch notifications'));

        render(<NotificationBell />);

        // Check that the error doesn't crash the app and the fallback text is shown
        await waitFor(() => {
            expect(screen.getByText(/no notifications/i)).toBeInTheDocument();
        });
    });
});





// Features Covered in Tests
// Initial Rendering:

// Ensures the bell icon and unread count are displayed properly.
// Dropdown Functionality:

// Verifies that clicking the bell toggles the dropdown open/close.
// Mark All as Read:

// Simulates marking all notifications as read and checks the unread count is updated correctly.
// No Notifications:

// Tests that a "No notifications" message is shown when there are no notifications.
// Error Handling:

// Ensures that API errors are handled gracefully, showing no notifications if fetching fails.