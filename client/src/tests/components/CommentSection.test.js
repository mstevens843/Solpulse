import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import axios from 'axios';
import { io } from 'socket.io-client';
import CommentSection from '../../components/Post_components/CommentSection';

// Mocking axios
jest.mock('axios');

// Correctly mock socket.io-client
jest.mock('socket.io-client', () => {
  return {
    io: jest.fn().mockReturnValue({
      on: jest.fn(),
      off: jest.fn(),
      disconnect: jest.fn(),
    })
  };
});

describe('CommentSection Component', () => {
  const mockPostId = '123';
  const mockInitialComments = [
    { id: 1, author: 'User1', content: 'Great post!' },
    { id: 2, author: 'User2', content: 'Thanks for sharing.' },
  ];

  let socketMock;

  beforeEach(() => {
    socketMock = io(); 
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial comments', () => {
    render(<CommentSection postId={mockPostId} initialComments={mockInitialComments} />);

    mockInitialComments.forEach((comment) => {
      expect(screen.getByText(`${comment.author}: ${comment.content}`)).toBeInTheDocument();
    });
  });

  it('allows adding a new comment', async () => {
    axios.post.mockResolvedValueOnce({ data: { id: 3, author: 'CurrentUser', content: 'New comment!' } });

    render(<CommentSection postId={mockPostId} initialComments={mockInitialComments} />);

    const input = screen.getByPlaceholderText('Add a comment...');
    const button = screen.getByRole('button', { name: /submit your comment/i });

    fireEvent.change(input, { target: { value: 'New comment!' } });
    expect(input.value).toBe('New comment!');

    fireEvent.click(button);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/api/comments`,
        expect.objectContaining({ postId: mockPostId, content: 'New comment!' })
      );
      expect(input.value).toBe('');
    });
  });

  it('handles WebSocket events correctly', () => {
    const newComment = { id: 3, author: 'User3', content: 'WebSocket comment!' };

    render(<CommentSection postId={mockPostId} initialComments={mockInitialComments} />);

    // Simulate the WebSocket event
    const handleNewComment = socketMock.on.mock.calls.find(([event]) => event === 'new-comment')[1];
    act(() => {
      handleNewComment(newComment);
    });

    expect(screen.getByText(newComment.content)).toBeInTheDocument();
  });

  it('handles errors when adding a comment', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network Error'));

    render(<CommentSection postId={mockPostId} initialComments={mockInitialComments} />);

    const input = screen.getByPlaceholderText('Add a comment...');
    const button = screen.getByRole('button', { name: /submit your comment/i });

    fireEvent.change(input, { target: { value: 'Failing comment' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(screen.getByText('Failed to add comment. Please try again.')).toBeInTheDocument();
    });
  });

  it('cleans up WebSocket listeners on unmount', () => {
    const { unmount } = render(<CommentSection postId={mockPostId} initialComments={mockInitialComments} />);
    unmount();

    expect(socketMock.off).toHaveBeenCalledWith('new-comment', expect.any(Function));
    expect(socketMock.disconnect).toHaveBeenCalled();
  });
});