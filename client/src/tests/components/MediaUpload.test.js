import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import MediaUpload from '../../components/MediaUpload';
import axios from 'axios';

jest.mock('axios');

describe('MediaUpload Component', () => {
    const mockOnMediaUpload = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const selectFile = (file) => {
        const fileInput = screen.getByLabelText(/upload media file/i);
        fireEvent.change(fileInput, { target: { files: [file] } });
    };

    it('renders the MediaUpload component correctly', () => {
        render(<MediaUpload onMediaUpload={mockOnMediaUpload} />);
        expect(screen.getByLabelText(/upload media file/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/add a caption or description/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/tag a crypto asset/i)).toBeInTheDocument();
    });

    it('displays an error for unsupported file types', () => {
        render(<MediaUpload onMediaUpload={mockOnMediaUpload} />);
        const invalidFile = new File(['content'], 'file.txt', { type: 'text/plain' });
        selectFile(invalidFile);

        expect(screen.getByText(/Unsupported file type. Allowed types are JPEG, PNG, or MP4./i)).toBeInTheDocument();
    });

    it('displays an error for files exceeding the size limit', () => {
        render(<MediaUpload onMediaUpload={mockOnMediaUpload} maxFileSize={5 * 1024 * 1024} />); // 5MB limit
        const largeFile = new File(['content'.repeat(2000)], 'large-file.jpg', { type: 'image/jpeg' });
        selectFile(largeFile);

        expect(screen.getByText(/File size exceeds the limit of 5MB./i)).toBeInTheDocument();
    });

    it('handles valid file selection correctly', () => {
        render(<MediaUpload onMediaUpload={mockOnMediaUpload} />);
        const validFile = new File(['content'], 'image.jpg', { type: 'image/jpeg' });
        selectFile(validFile);

        expect(screen.getByText(/Selected file: image.jpg/i)).toBeInTheDocument();
    });

    it('uploads a valid file and calls onMediaUpload', async () => {
        axios.post.mockResolvedValueOnce({ data: { post: { id: 1, media: 'image.jpg' } } });
        render(<MediaUpload onMediaUpload={mockOnMediaUpload} />);

        const validFile = new File(['content'], 'image.jpg', { type: 'image/jpeg' });
        selectFile(validFile);
        const uploadButton = screen.getByRole('button', { name: /upload/i });

        fireEvent.click(uploadButton);

        await waitFor(() => {
            expect(mockOnMediaUpload).toHaveBeenCalledWith({ id: 1, media: 'image.jpg' });
        });
        expect(screen.queryByText(/uploading/i)).not.toBeInTheDocument();
    });

    it('displays an error when the upload fails', async () => {
        axios.post.mockRejectedValueOnce(new Error('Upload failed'));
        render(<MediaUpload onMediaUpload={mockOnMediaUpload} />);

        const validFile = new File(['content'], 'image.jpg', { type: 'image/jpeg' });
        selectFile(validFile);
        const uploadButton = screen.getByRole('button', { name: /upload/i });

        fireEvent.click(uploadButton);

        await waitFor(() => {
            expect(screen.getByText(/Failed to upload the file. Please try again./i)).toBeInTheDocument();
        });
    });

    it('disables the upload button while uploading', async () => {
        axios.post.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 1000)));
        render(<MediaUpload onMediaUpload={mockOnMediaUpload} />);

        const validFile = new File(['content'], 'image.jpg', { type: 'image/jpeg' });
        selectFile(validFile);
        const uploadButton = screen.getByRole('button', { name: /upload/i });

        fireEvent.click(uploadButton);
        expect(uploadButton).toBeDisabled();

        await waitFor(() => {
            expect(uploadButton).not.toBeDisabled();
        });
    });
});





// Key Features of the Test File
// Basic Rendering:

// Ensures that all elements like file input, text areas, and upload buttons are rendered correctly.
// Error Handling:

// Tests for unsupported file types and oversized files.
// File Selection:

// Verifies that valid file selections update the UI.
// Successful Upload:

// Mocks a successful API response and ensures onMediaUpload is called with the correct data.
// Error on Upload Failure:

// Simulates a failed upload and checks that the error message is displayed.
// Button State:

// Ensures the upload button is disabled during the upload process.