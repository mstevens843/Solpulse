import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserCard from '../../components/Profile_components/UserCard';
import FollowButton from '../../components/Profile_components/FollowButton';

// Mock the FollowButton component
jest.mock('../../components/FollowButton', () => jest.fn(() => <button>Mock Follow Button</button>));

describe('UserCard Component', () => {
    const mockUser = {
        id: 1,
        username: 'testuser',
        avatar: 'https://example.com/avatar.jpg',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    it('renders the UserCard with user data', () => {
        render(<UserCard user={mockUser} />);

        expect(screen.getByRole('img', { name: /testuser's avatar/i })).toBeInTheDocument();
        expect(screen.getByText(/testuser/i)).toBeInTheDocument();
        // Ensure the mock Follow Button is rendered and clickable using getByRole
        expect(screen.getByRole('button', { name: /mock follow button/i })).toBeInTheDocument();
    });

    it('renders default avatar when avatar is missing', () => {
        render(<UserCard user={{ ...mockUser, avatar: null }} />);

        const avatarImg = screen.getByRole('img', { name: /testuser's avatar/i });
        expect(avatarImg).toHaveAttribute(
            'src',
            `${process.env.REACT_APP_API_URL}/default-avatar.png`
        );
    });

    it('handles image error and renders default avatar', () => {
        render(<UserCard user={mockUser} />);

        const avatarImg = screen.getByRole('img', { name: /testuser's avatar/i });
        fireEvent.error(avatarImg);

        expect(avatarImg).toHaveAttribute(
            'src',
            `${process.env.REACT_APP_API_URL}/default-avatar.png`
        );
    });

    it('does not render when user data is invalid', () => {
        const { container } = render(<UserCard user={null} />);
        expect(container.firstChild).toBeNull();

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        render(<UserCard user={{}} />);
        expect(consoleSpy).toHaveBeenCalledWith(
            'Invalid user data provided to UserCard:',
            {}
        );
        consoleSpy.mockRestore();
    });

    it('passes the correct userId to the FollowButton', () => {
        render(<UserCard user={mockUser} />);

        expect(FollowButton).toHaveBeenCalledWith(
            expect.objectContaining({ userId: mockUser.id }),
            {}
        );
    });

    it('handles lazy loading for the user avatar', () => {
        render(<UserCard user={mockUser} />);

        const avatarImg = screen.getByRole('img', { name: /testuser's avatar/i });
        expect(avatarImg).toHaveAttribute('loading', 'lazy');
    });

    it('renders the username correctly', () => {
        render(<UserCard user={mockUser} />);
        expect(screen.getByText(mockUser.username)).toBeInTheDocument();
    });
});