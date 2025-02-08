const request = require('supertest');
const express = require('express');
const { body } = require('express-validator');
const validationErrorHandler = require('../../middleware/validationErrorHandler');

const app = express();
app.use(express.json());

app.post(
  '/register',
  [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  ],
  validationErrorHandler,
  (req, res) => {
    res.status(200).json({ message: 'User registered successfully' });
  }
);

describe('Validation Error Handler', () => {
  it('should return a 400 status code with formatted validation errors when validation fails', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: 'invalid-email',
        password: 'short',
      });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('Validation failed');
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        { field: 'email', message: 'Invalid email address' },
        { field: 'password', message: 'Password must be at least 8 characters long' },
      ])
    );
  });

  it('should allow valid data without triggering validation errors', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User registered successfully');
  });

  it('should handle missing fields gracefully', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: '',
      });

    expect(response.status).toBe(400);
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        { field: 'email', message: 'Invalid email address' },
        { field: 'password', message: 'Password must be at least 8 characters long' },
      ])
    );
  });

  it('should reject extra fields gracefully', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        extraField: 'extraValue',
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User registered successfully');
  });
});

