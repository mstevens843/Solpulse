const request = require('supertest');
const express = require('express');
const rateLimiter = require('../../middleware/rateLimiter');

const app = express();
app.use(rateLimiter(3, 5000)); // Allow 3 requests per 5 seconds

app.get('/test', (req, res) => {
  res.status(200).send('OK');
});

describe('Rate Limiter Middleware', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should allow 3 requests within 5 seconds', async () => {
    await request(app).get('/test').expect(200);
    await request(app).get('/test').expect(200);
    await request(app).get('/test').expect(200);
  });

  it('should return 429 status code after exceeding rate limit', async () => {
    await request(app).get('/test').expect(200);
    await request(app).get('/test').expect(200);
    await request(app).get('/test').expect(200);

    const response = await request(app).get('/test');
    expect(response.status).toBe(429);
    expect(response.body.error).toBe('Too many requests, please try again later.');
    expect(response.body.retryAfter).toBeGreaterThan(0);
  });

  it('should reset after the time window expires', async () => {
    await request(app).get('/test').expect(200);
    await request(app).get('/test').expect(200);
    await request(app).get('/test').expect(200);

    // Simulate time passage
    jest.advanceTimersByTime(5000);

    await request(app).get('/test').expect(200); // Should succeed after reset
  });

  it('should handle concurrent requests correctly', async () => {
    const requests = Array.from({ length: 3 }, () => request(app).get('/test'));
    const responses = await Promise.all(requests);

    responses.forEach((response) => {
      expect(response.status).toBe(200);
    });

    const excessResponse = await request(app).get('/test');
    expect(excessResponse.status).toBe(429);
  });
});




// Explanation of the Tests:
// Test 1 (Allow requests): Makes 3 requests within 5 seconds and ensures all requests are successful (200).
// Test 2 (Exceed rate limit): Makes 4 requests, where the 4th request should be blocked with a 429 status code (rate limit exceeded).
// Test 3 (Window Reset): After reaching the rate limit, it waits for 5 seconds (the window period) and ensures the limit is reset, allowing a 4th request.