import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Post from '../../components/Post';

jest.mock('../../components/LikeButton', () => jest.fn(({ postId }) => <button>Like {postId}</button>));
jest.mock('../../components/RetweetButton', () => jest.fn(({ postId }) => <button>Retweet {postId}</button>));
jest.mock('../../components/CommentSection', () =>
  jest.fn(({ postId, comments }) => (
    <div>
      Comments for {postId} ({comments.length})
    </div>
  ))
);
jest.mock('../../components/CryptoTip', () =>
  jest.fn(({ recipient }) => <button>Tip {recipient}</button>)
);
jest.mock('../../components/MediaUpload', () =>
  jest.fn(({ onUpload }) => (
    <div>
      <button onClick={() => onUpload('mock-media-url')}>Upload Media</button>
    </div>
  ))
);

describe('Post Component', () => {
  const mockPost = {
    id: '1',
    author: 'Test Author',
    content: 'This is a test post.',
    createdAt: '2023-12-01T10:00:00Z',
    media: null,
    mediaType: null,
    cryptoTag: 'solana',
    likes: 10,
    authorWallet: 'test-wallet-address',
    comments: [
      { id: 'c1', author: 'Commenter 1', content: 'Nice post!' },
      { id: 'c2', author: 'Commenter 2', content: 'Great post!' },
    ],
  };

  const onCommentAddMock = jest.fn();
  const onMediaUploadMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders post with basic details', () => {
    render(<Post post={mockPost} onCommentAdd={onCommentAddMock} onMediaUpload={onMediaUploadMock} />);

    // Check author
    expect(screen.getByText('Test Author')).toBeInTheDocument();

    // Check date with regex for flexibility
    expect(screen.getByText(/12\/1\/2023/)).toBeInTheDocument();

    // Check content
    expect(screen.getByText('This is a test post.')).toBeInTheDocument();

    // Check crypto tag
    expect(screen.getByText('#solana')).toBeInTheDocument();
  });

  it('renders media when available', () => {
    const postWithMedia = {
      ...mockPost,
      media: 'test-media-url',
      mediaType: 'image',
    };

    render(<Post post={postWithMedia} onCommentAdd={onCommentAddMock} onMediaUpload={onMediaUploadMock} />);

    const media = screen.getByAltText('Post media');
    expect(media).toBeInTheDocument();
    expect(media.src).toContain('test-media-url');
  });

  it('renders MediaUpload when no media is available', () => {
    const postWithoutMedia = { ...mockPost, media: null, mediaType: null };

    render(
      <Post
        post={postWithoutMedia}
        onCommentAdd={onCommentAddMock}
        onMediaUpload={onMediaUploadMock}
      />
    );

    // Debug rendered output
    screen.debug();

    // Use a flexible query
    const uploadButton = screen.getByText((content) => content.includes('Upload Media'));
    expect(uploadButton).toBeInTheDocument();

    fireEvent.click(uploadButton);
    expect(onMediaUploadMock).toHaveBeenCalledWith('1', 'mock-media-url');
  });

  it('handles missing author gracefully', () => {
    const postWithoutAuthor = { ...mockPost, author: null };

    render(<Post post={postWithoutAuthor} onCommentAdd={onCommentAddMock} onMediaUpload={onMediaUploadMock} />);

    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });

  it('handles empty content gracefully', () => {
    const postWithoutContent = { ...mockPost, content: null };

    render(<Post post={postWithoutContent} onCommentAdd={onCommentAddMock} onMediaUpload={onMediaUploadMock} />);

    expect(screen.getByText('No content available.')).toBeInTheDocument();
  });
});
