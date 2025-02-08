import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import PostCreation from '../../Archive/PostCreation';

// Mock axios
jest.mock('axios');

// Mock MediaUpload and Hashtag components
jest.mock('../../components/MediaUpload', () => ({ onMediaSelect }) => (
    <input
        type="file"
        aria-label="Upload Media"
        onChange={(e) => onMediaSelect(e.target.files[0])}
    />
));

jest.mock('../../components/Hashtag', () => ({ value, onChange }) => (
    <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tag a crypto asset"
    />
));

describe('PostCreation Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the post creation form correctly', () => {
        render(<PostCreation />);
        expect(screen.getByPlaceholderText("What's happening?")).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /post/i })).toBeInTheDocument();
    });

    it('displays an error when content is empty', async () => {
        render(<PostCreation />);
        fireEvent.click(screen.getByRole('button', { name: /post/i }));
        expect(await screen.findByText(/content cannot be empty/i)).toBeInTheDocument();
    });

    it('displays an error when content exceeds 280 characters', async () => {
        render(<PostCreation />);
        fireEvent.change(screen.getByPlaceholderText("What's happening?"), {
            target: { value: 'a'.repeat(281) },
        });
        fireEvent.click(screen.getByRole('button', { name: /post/i })); // Fixed missing parenthesis

        await waitFor(() => {
            expect(screen.getByText('Content cannot exceed 280 characters.')).toBeInTheDocument();
        });
    });

    it('validates media file type and size', async () => {
        render(<PostCreation />);
        const mediaInput = screen.getByLabelText('Upload Media');

        // Invalid file type
        const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
        fireEvent.change(mediaInput, { target: { files: [invalidFile] } });
        expect(await screen.findByText(/only jpg, png, and mp4 files are allowed/i)).toBeInTheDocument();

        // Invalid file size
        const largeFile = new File(['a'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
        fireEvent.change(mediaInput, { target: { files: [largeFile] } });
        expect(await screen.findByText(/file size must not exceed 5mb/i)).toBeInTheDocument();
    });

    it('submits the form successfully', async () => {
        axios.post.mockResolvedValueOnce({ data: { success: true } });
        render(<PostCreation />);

        fireEvent.change(screen.getByPlaceholderText("What's happening?"), {
            target: { value: 'This is a test post.' },
        });
        fireEvent.click(screen.getByRole('button', { name: /post/i }));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledTimes(1);
            expect(axios.post).toHaveBeenCalledWith(
                `${process.env.REACT_APP_API_URL}/posts`,
                expect.any(FormData),
                expect.any(Object)
            );
            expect(screen.getByText(/post created successfully/i)).toBeInTheDocument();
        });
    });

    it('displays an error message when submission fails', async () => {
        axios.post.mockRejectedValueOnce({
            response: { data: { error: 'Failed to create the post. Please try again.' } },
        });

        render(<PostCreation />);

        fireEvent.change(screen.getByPlaceholderText("What's happening?"), {
            target: { value: 'This is a test post.' },
        });
        fireEvent.click(screen.getByRole('button', { name: /post/i }));

        await waitFor(() => {
            expect(screen.getByText('Failed to create the post. Please try again.')).toBeInTheDocument();
        });
    });
});