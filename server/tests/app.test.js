const request = require('supertest');
const app = require('../app'); // Import the app (server)

describe('POST /register', () => {
  it('should register a user successfully with valid data', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User registered successfully');
  });

  it('should return 400 if email is invalid', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: 'invalid-email',
        password: 'password123',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed');
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'email',
          message: 'Invalid email address',
        }),
      ])
    );
  });

  it('should return 400 if password is too short', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: 'test@example.com',
        password: 'short',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed');
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'password',
          message: 'Password must be at least 8 characters long',
        }),
      ])
    );
  });

  it('should return 429 if rate limit is exceeded', async () => {
    const mockRequests = [];
    for (let i = 0; i < 101; i++) {
      mockRequests.push(
        request(app)
          .post('/register')
          .send({
            email: 'test@example.com',
            password: 'password123',
          })
      );
    }

    // The 101st request should be blocked by the rate limiter
    const response = await mockRequests[100];
    expect(response.status).toBe(429);
    expect(response.body.error).toBe('Too many requests, please try again later.');
  });
});

describe('GET /api', () => {
  it('should return 404 if route does not exist', async () => {
    const response = await request(app).get('/non-existent-route');
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe('Resource not found');
  });
});

describe('General Error Handling', () => {
  it('should return 500 for server errors', async () => {
    const response = await request(app).post('/register').send({
      email: 'test@example.com',
    }); // Missing password field should trigger an internal error
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Server error');
  });
});