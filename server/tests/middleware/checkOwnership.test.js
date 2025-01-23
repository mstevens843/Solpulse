const request = require('supertest');
const { sequelize, Post, User } = require('../../models/Index');
const app = require('../../app'); // Assuming your app is set up in `server.js`
const { generateToken } = require('../../utils/token'); // Import the token generation function

describe('checkOwnership Middleware', () => {
  let user;
  let otherUser;
  let post;
  let userToken;
  let otherUserToken;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create two users
    user = await User.create({
      username: 'testuserskeeter',
      email: 'testuserskeeter@example.com',
      password: 'password123',
      walletAddress: '3adeWDDDV7zNbuZ8nNrZ7DT6m1dsKYMiyukvJqf6Jiwr',
    });

    otherUser = await User.create({
      username: 'otheruserskeeter',
      email: 'otheruserskeeter@example.com',
      password: 'password123',
      walletAddress: '47qshMp8kzQ9KERnUHsoJyyVpq3BgPjq77VZbL6n8evj',
    });

    // Generate tokens for both users using generateToken function
    userToken = `Bearer ${generateToken({ id: user.id, username: user.username, email: user.email })}`;
    otherUserToken = `Bearer ${generateToken({ id: otherUser.id, username: otherUser.username, email: otherUser.email })}`;

    // Create a post for the first user
    post = await Post.create({
      userId: user.id,
      content: 'This is a test post',
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should allow the owner to access their post', async () => {
    const response = await request(app)
      .put(`/api/posts/${post.id}`)
      .set('Authorization', userToken)
      .send({ content: 'Updated content' });

    expect(response.status).toBe(200);
    expect(response.body.content).toBe('Updated content');
  });

  it('should deny access for non-owners', async () => {
    const response = await request(app)
      .put(`/api/posts/${post.id}`)
      .set('Authorization', otherUserToken)
      .send({ content: 'Updated content by non-owner' });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('You are not authorized to perform this action on this post');
  });

  it('should return 404 if post does not exist', async () => {
    const response = await request(app)
      .put('/api/posts/999999') // Non-existent post ID
      .set('Authorization', userToken)
      .send({ content: 'This should fail' });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Post not found');
  });
});



// Explanation:
// Setup:
// We create two users (user and otherUser) and a post for the user.
// The sequelize.sync({ force: true }) ensures that the database is reset before each test run.
// Tests:
// Test 1: Ensures that the owner of the post can successfully edit their post.
// Test 2: Ensures that a non-owner cannot access or modify the post.
// Test 3: Tests that a 404 response is returned if the post does not exist.
// Requirements:
// Ensure that your app (server.js) is properly set up to run the tests.
// This assumes that you're using JWT tokens for authentication. If you're using another method, adjust the authentication part of the tests accordingly.