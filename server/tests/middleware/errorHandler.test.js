const request = require('supertest');
const express = require('express');
const errorHandler = require('../../middleware/errorHandler'); // Path to your error handler

describe('Error Handler Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();

    // Sample route to trigger errors
    app.use('/error', (req, res, next) => {
      const error = new Error('Test error');
      error.code = 'TEST_ERROR';
      next(error);
    });

    // Sample route for 404 errors
    app.use('*', (req, res) => {
      res.status(404).json({
        error: {
          message: 'Not Found',
          code: 'NOT_FOUND',
        },
      });
    });

    // Using the error handler middleware
    app.use(errorHandler);
  });

  afterEach(() => {
    delete process.env.NODE_ENV; // Reset environment variable
  });

  it('should return a 500 error for unhandled exceptions', async () => {
    const response = await request(app).get('/error');
    expect(response.status).toBe(500);
    expect(response.body.error.message).toBe('Test error');
    expect(response.body.error.code).toBe('TEST_ERROR');
  
    if (process.env.NODE_ENV !== 'production') {
      expect(response.body.error.stack).toBeDefined(); // Stack trace should be available in non-production
    } else {
      expect(response.body.error.stack).toBeUndefined(); // Stack trace should be hidden in production
    }
  });

  it('should return a 404 error for non-existent routes', async () => {
    const response = await request(app).get('/non-existent-route');
    expect(response.status).toBe(404);
    expect(response.body.error.message).toBe('Not Found');
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('should hide stack trace in production environment', async () => {
    process.env.NODE_ENV = 'production'; // Set environment to production
    const response = await request(app).get('/error');
    expect(response.status).toBe(500);
    expect(response.body.error.message).toBe('Test error');
    expect(response.body.error.stack).toBeUndefined(); // Stack should not be visible in production
  });

  it('should include stack trace in non-production environment', async () => {
    process.env.NODE_ENV = 'development'; // Set environment to development
    const response = await request(app).get('/error');
    expect(response.status).toBe(500);
    expect(response.body.error.message).toBe('Test error');
    expect(response.body.error.stack).toBeDefined(); // Stack should be visible in non-production
  });

  it('should return a structured error response with additional properties', async () => {
    const response = await request(app).get('/error');
    expect(response.status).toBe(500);
    expect(response.body.error).toHaveProperty('message', 'Test error');
    expect(response.body.error).toHaveProperty('code', 'TEST_ERROR');
    expect(response.body.error).toHaveProperty('stack');
  });
});

 
