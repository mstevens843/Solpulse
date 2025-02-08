import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RetweetButton from '../../components/Post_components/RetweetButton';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('RetweetButton Component', () => {
    const postId = '12345';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the retweet button', () => {
        render(<RetweetButton postId={postId} />);
        expect(screen.getByRole('button', { name: /retweet this post/i })).toBeInTheDocument();
    });

    it('displays a success message after a successful retweet', async () => {
        axios.post.mockResolvedValue({});
        render(<RetweetButton postId={postId} />);

        fireEvent.click(screen.getByRole('button', { name: /retweet this post/i }));

        expect(screen.getByRole('button', { name: /retweeting.../i })).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Post retweeted successfully!')).toBeInTheDocument();
        });

        expect(axios.post).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/posts/${postId}/retweet`);
    });

    it('displays an error message if the retweet fails', async () => {
        axios.post.mockRejectedValue(new Error('Network Error'));
        render(<RetweetButton postId={postId} />);

        fireEvent.click(screen.getByRole('button', { name: /retweet this post/i }));

        await waitFor(() => {
            expect(screen.getByText('Failed to retweet the post.')).toBeInTheDocument();
        });

        expect(axios.post).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/posts/${postId}/retweet`);
    });

    it('disables the button while the retweet is in progress', async () => {
        axios.post.mockResolvedValue({});
        render(<RetweetButton postId={postId} />);

        const button = screen.getByRole('button', { name: /retweet this post/i });
        fireEvent.click(button);

        expect(button).toBeDisabled();

        await waitFor(() => {
            expect(button).not.toBeDisabled();
        });
    });

    it('clears the status message when a new retweet attempt is made', async () => {
        axios.post
            .mockRejectedValueOnce(new Error('Network Error'))
            .mockResolvedValueOnce({});

        render(<RetweetButton postId={postId} />);

        // First attempt fails
        fireEvent.click(screen.getByRole('button', { name: /retweet this post/i }));
        await waitFor(() =>
            expect(screen.getByText('Failed to retweet the post.')).toBeInTheDocument()
        );

        // Second attempt succeeds
        fireEvent.click(screen.getByRole('button', { name: /retweet this post/i }));
        await waitFor(() =>
            expect(screen.getByText('Post retweeted successfully!')).toBeInTheDocument()
        );
    });
});