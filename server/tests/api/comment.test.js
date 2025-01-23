const request = require('supertest');
const app = require('../../app');
const db = require('../../models');
const jwt = require('jsonwebtoken');

// Mock WebSocket helper
jest.mock('../../utils/websocket', () => ({
  handleCommentEvent: jest.fn(),
}));

describe('Comments API Routes', () => {
  let token, post, comment;

  beforeAll(async () => {
    const users = await db.User.findAll();
    const posts = await db.Post.findAll();

    if (users.length === 0 || posts.length === 0) {
      throw new Error('Insufficient users or posts for testing.');
    }

    const user = users[0];
    token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    post = posts[0];
    comment = await db.Comment.create({
      userId: user.id,
      postId: post.id,
      content: 'Test comment for reactions',
    });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  describe('POST /comments', () => {
    it('should create a new comment', async () => {
      const res = await request(app)
        .post('/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({ postId: post.id, content: 'New comment from test' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.content).toBe('New comment from test');
    });

    it('should return validation error for missing content', async () => {
      const res = await request(app)
        .post('/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({ postId: post.id });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].msg).toBe('Content is required');
    });
  });

  describe('POST /comments/:id/react', () => {
    it('should add a reaction to a comment', async () => {
      const res = await request(app)
        .post(`/comments/${comment.id}/react`)
        .set('Authorization', `Bearer ${token}`)
        .send({ reaction: 'like' });

      expect(res.status).toBe(200);
      expect(res.body.reactions.like).toBe(1);
    });

    it('should return 404 for invalid comment ID', async () => {
      const res = await request(app)
        .post('/comments/999/react')
        .set('Authorization', `Bearer ${token}`)
        .send({ reaction: 'like' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Comment not found');
    });
  });

  describe('PUT /comments/:id', () => {
    it('should update a comment', async () => {
      const res = await request(app)
        .put(`/comments/${comment.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Updated test comment' });

      expect(res.status).toBe(200);
      expect(res.body.content).toBe('Updated test comment');
    });
  });

  describe('DELETE /comments/:id', () => {
    it('should delete a comment', async () => {
      const res = await request(app)
        .delete(`/comments/${comment.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(204);
    });
  });
});



// Key Features:
// Setup and Cleanup:

// beforeAll sets up a user, post, and token for authenticated testing.
// afterAll closes the database connection.
// Mocking WebSocket Events:

// Mocks the handleCommentEvent function to prevent WebSocket broadcasting during tests.
// Tested Endpoints:

// /comments: Tests for successful comment creation and validation errors.
// /comments/:id/react: Tests for adding reactions to comments.
// /comments/:id: Tests for editing comments.
// /comments/:id: Tests for deleting comments.
// Authentication:

// Uses a valid JWT token to test protected routes.
// Validation and Error Handling:

// Ensures proper validation and error responses for invalid inputs or unauthorized actions.