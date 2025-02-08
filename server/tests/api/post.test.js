const request = require('supertest');
const app = require('../../app'); // Import your Express app
const db = require('../../models'); // Import your Sequelize models
const { sequelize, Post, User, Comment } = db;
const jwt = require('jsonwebtoken');

describe('Posts API', () => {
  let user, token, post;

  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Reset the database

    // Create a test user and generate a token
    user = await User.create({
      username: 'testuserski',
      email: 'testuserski@example.com',
      password: 'password123',
      walletAddress: '37R4hVFu5Rnv3vgoTUaz2ZbEPhQZ3Fn48uqa7a84qxRi',
    });
    token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Create a test post
    post = await Post.create({
      userId: user.id,
      content: 'This is a test post',
      cryptoTag: 'bitcoin',
      likes: 0,
      retweets: 0,
    });
  });

  afterAll(async () => {
    await sequelize.close(); // Close the database connection
  });

  describe('POST /api/posts', () => {
    it('should create a new post', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'New test post',
          cryptoTag: 'ethereum',
        });

      expect(res.status).toBe(201);
      expect(res.body.post).toHaveProperty('id');
      expect(res.body.post.content).toBe('New test post');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).post('/api/posts').send({ content: 'Another test post' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/posts', () => {
    it('should fetch paginated posts', async () => {
      const res = await request(app).get('/api/posts?page=1&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.posts).toHaveLength(2); // Includes the seeded post
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should fetch a single post with comments', async () => {
      const res = await request(app).get(`/api/posts/${post.id}`);
      expect(res.status).toBe(200);
      expect(res.body.post).toHaveProperty('id', post.id);
      expect(res.body.comments).toBeDefined();
    });

    it('should return 404 for a non-existent post', async () => {
      const res = await request(app).get('/api/posts/9999');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/posts/:id/like', () => {
    it('should like a post', async () => {
      const res = await request(app)
        .post(`/api/posts/${post.id}/like`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.likes).toBe(1);

      const updatedPost = await Post.findByPk(post.id);
      expect(updatedPost.likes).toBe(1);
    });

    it('should return 404 for a non-existent post', async () => {
      const res = await request(app)
        .post('/api/posts/9999/like')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/posts/:id/retweet', () => {
    it('should retweet a post', async () => {
      const res = await request(app)
        .post(`/api/posts/${post.id}/retweet`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.retweets).toBe(1);

      const updatedPost = await Post.findByPk(post.id);
      expect(updatedPost.retweets).toBe(1);
    });

    it('should return 404 for a non-existent post', async () => {
      const res = await request(app)
        .post('/api/posts/9999/retweet')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/posts/:id', () => {
    it('should update a post', async () => {
      const res = await request(app)
        .put(`/api/posts/${post.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Updated content' });
      expect(res.status).toBe(200);
      expect(res.body.post.content).toBe('Updated content');

      const updatedPost = await Post.findByPk(post.id);
      expect(updatedPost.content).toBe('Updated content');
    });

    it('should return 404 for a non-existent post', async () => {
      const res = await request(app)
        .put('/api/posts/9999')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Should fail' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete a post', async () => {
      const res = await request(app)
        .delete(`/api/posts/${post.id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(204);

      const deletedPost = await Post.findByPk(post.id);
      expect(deletedPost).toBeNull();
    });

    it('should return 404 for a non-existent post', async () => {
      const res = await request(app)
        .delete('/api/posts/9999')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });
});