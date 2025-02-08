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