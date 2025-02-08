const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middleware/auth'); // Path to your middleware
require('dotenv').config(); // Load environment variables

// Fallback if JWT_SECRET is not loaded
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

// Create an Express app to test the middleware
const app = express();

// Sample protected route that uses the authMiddleware
app.get('/protected', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Access granted' });
});

describe('authMiddleware', () => {
  let validToken;
  let expiredToken;
  const invalidToken = 'invalid.token.here'; // Invalid token format for testing

  beforeAll(() => {
    // Generate a valid token
    validToken = jwt.sign(
      { id: 1, username: 'testuser', email: 'testuser@example.com' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Generate an expired token
    expiredToken = jwt.sign(
      { id: 1, username: 'testuser', email: 'testuser@example.com' },
      process.env.JWT_SECRET,
      { expiresIn: '-1s' }
    );
  });

  it('should allow access with a valid token from x-auth-token', async () => {
    const response = await request(app)
      .get('/protected')
      .set('x-auth-token', validToken);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Access granted');
  });

  it('should allow access with a valid token from Authorization header', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Access granted');
  });

  it('should deny access with an expired token', async () => {
    const response = await request(app)
      .get('/protected')
      .set('x-auth-token', expiredToken);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Token has expired');
  });

  it('should deny access with an invalid token', async () => {
    const response = await request(app)
      .get('/protected')
      .set('x-auth-token', invalidToken);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Token is invalid');
  });

  it('should deny access when no token is provided', async () => {
    const response = await request(app).get('/protected');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('No token provided, authorization denied');
  });

  it('should allow access if Authorization header is missing Bearer prefix', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', validToken); // Valid token but no 'Bearer ' prefix

    expect(response.status).toBe(200); // Middleware allows access without Bearer prefix
    expect(response.body.message).toBe('Access granted');
  });

  it('should handle unexpected errors during token verification', async () => {
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    const response = await request(app)
      .get('/protected')
      .set('x-auth-token', validToken);

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('An error occurred during token verification');

    jwt.verify.mockRestore(); // Restore original implementation
  });
});