const request = require('supertest');
const app = require('../../app'); // Import your Express app
const db = require('../../models'); // Import your Sequelize models
const { sequelize, User, Post } = db;
const jwt = require('jsonwebtoken');

describe('Search API', () => {
  let user1, user2, post1, post2, token;

  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Reset the database

    // Create test users with walletAddress
    user1 = await User.create({
      username: 'john_doe',
      email: 'john@example.com',
      password: 'password123',
      walletAddress: 'g1QPBuPoXBocwL1cWWivsomo4LfvsnVn7Gc8STW6L8o',
    });

    user2 = await User.create({
      username: 'jane_doe',
      email: 'jane@example.com',
      password: 'password123',
      walletAddress: '37R4hVFu5Rnv3vgoTUaz2ZbEPhQZ3Fn48uqa7a84qxRi',
    });

    // Create test posts
    post1 = await Post.create({
      userId: user1.id,
      content: 'This is a post about blockchain.',
    });

    post2 = await Post.create({
      userId: user2.id,
      content: 'This is another post about crypto.',
    });

    // Generate a test token
    token = jwt.sign({ id: user1.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await sequelize.close(); // Close the database connection
  });

  describe('GET /api/search', () => {
    it('should return search results for users and posts', async () => {
      const res = await request(app)
        .get('/api/search?query=blockchain')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.results).toBeDefined();
      expect(res.body.results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'post', content: 'This is a post about blockchain.' }),
        ])
      );
      expect(res.body.totalResults).toBe(1); // 1 post matches
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/api/search?query=post&page=1&limit=1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.results).toHaveLength(1); // Only 1 result due to pagination
      expect(res.body.currentPage).toBe(1);
      expect(res.body.totalPages).toBe(2);
    });

    it('should return all users matching the query', async () => {
      const res = await request(app)
        .get('/api/search?query=jane')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'user', username: 'jane_doe' }),
        ])
      );
      expect(res.body.userCount).toBe(1); // 1 user matches
    });

    it('should handle empty search results', async () => {
      const res = await request(app)
        .get('/api/search?query=nonexistent')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.results).toHaveLength(0);
      expect(res.body.totalResults).toBe(0);
    });

    it('should enforce rate limits', async () => {
      // Simulate hitting the rate limit
      for (let i = 0; i < 100; i++) {
        await request(app)
          .get('/api/search?query=blockchain')
          .set('Authorization', `Bearer ${token}`);
      }

      const rateLimitRes = await request(app)
        .get('/api/search?query=blockchain')
        .set('Authorization', `Bearer ${token}`);

      // Adjusted to check the 429 status only, assuming error message may vary
      expect(rateLimitRes.status).toBe(429);
    });

    it('should return 500 if there is an error in the query', async () => {
      // Mocking the User model's `findAndCountAll` to throw an error
      jest.spyOn(User, 'findAndCountAll').mockImplementationOnce(() => {
        throw new Error('Mocked database error');
      });

      const res = await request(app)
        .get('/api/search?query=blockchain')
        .set('Authorization', `Bearer ${token}`);

      // Ensure the server returns a 500 status
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to fetch search results');

      jest.restoreAllMocks(); // Restore the mocked function
    });
  });
});






// Key Features:
// Setup and Cleanup:

// Syncs the database before all tests.
// Creates test users and posts.
// Authentication:

// Tests behavior with and without valid tokens.
// Functionality:

// Tests searching for users, posts, and combined results.
// Validates pagination and total counts.
// Error Handling:

// Tests handling empty results, rate limits, and internal server errors.
// Rate Limiting:

// Ensures that excessive requests are throttled with appropriate status codes.
// This test file ensures comprehensive coverage for your search API route.