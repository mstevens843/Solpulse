import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import axios from 'axios';
import LikeButton from '../../components/Post_components/Actions/LikeButton';

// Mock axios
jest.mock('axios');

describe('LikeButton Component', () => {
    const postId = '12345';
    const initialLikes = 10;

    let likeButton;

    beforeEach(() => {
        jest.clearAllMocks();
        render(<LikeButton postId={postId} initialLikes={initialLikes} />);
        likeButton = screen.getByRole('button', {
            name: `Like post. Current likes: ${initialLikes}`,
        });
    });

    it('renders the like button with initial likes', () => {
        expect(likeButton).toBeInTheDocument();
        expect(likeButton).toHaveTextContent(`Like (${initialLikes})`);
        expect(likeButton).toHaveAttribute('aria-label', `Like post. Current likes: ${initialLikes}`);
    });

    it('increments likes on successful like', async () => {
        axios.post.mockResolvedValueOnce({
            data: { likes: initialLikes + 1 },
        });

        await act(async () => {
            fireEvent.click(likeButton);
        });

        // Assert loading state
        expect(likeButton).toHaveTextContent('Liking...');

        // Wait for the final state after the request resolves
        await waitFor(() => expect(likeButton).toHaveTextContent(`Like (${initialLikes + 1})`));
        expect(likeButton).toHaveAttribute('aria-label', `Like post. Current likes: ${initialLikes + 1}`);
    });

    it('reverts likes on failure', async () => {
        axios.post.mockRejectedValueOnce(new Error('Failed to like'));

        await act(async () => {
            fireEvent.click(likeButton);
        });

        // Assert loading state
        expect(likeButton).toHaveTextContent('Liking...');

        // Wait for error message and reverted state
        await waitFor(() => expect(screen.getByText('Failed to like the post.')).toBeInTheDocument());
        expect(likeButton).toHaveTextContent(`Like (${initialLikes})`);
        expect(likeButton).toHaveAttribute('aria-label', `Like post. Current likes: ${initialLikes}`);
    });

    it('disables the button while liking', async () => {
        axios.post.mockResolvedValueOnce({
            data: { likes: initialLikes + 1 },
        });

        await act(async () => {
            fireEvent.click(likeButton);
        });

        // Assert button is disabled during request
        expect(likeButton).toBeDisabled();

        // Wait for the update
        await waitFor(() => expect(likeButton).toHaveTextContent(`Like (${initialLikes + 1})`));

        // Assert button is re-enabled after request
        expect(likeButton).not.toBeDisabled();
    });

    it('displays an error message on failure', async () => {
        axios.post.mockRejectedValueOnce(new Error('Failed to like'));

        await act(async () => {
            fireEvent.click(likeButton);
        });

        const errorMessage = await screen.findByText('Failed to like the post.');
        expect(errorMessage).toBeInTheDocument();
    });
});