const fs = require('fs');
const path = require('path');
const request = require('supertest');
const express = require('express');
const notFoundHandler = require('../../middleware/notFoundHandler'); // Import middleware

jest.mock('fs'); // Mock filesystem access

const app = express();

app.use((req, res, next) => {
  res.sendFile = jest.fn((filePath) => {
    res.status(404).send('404 Not Found Page Content'); // Mock the response for sendFile
  });
  next();
});

// Apply the notFoundHandler as middleware
app.use(notFoundHandler);

describe('notFoundHandler Middleware', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  it('should return JSON 404 for API requests', async () => {
    const response = await request(app).get('/api/non-existent-route');
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe('Resource not found');
  });

  it('should return HTML 404 for web page requests', async () => {
    // Mock the file existence and response
    const mockPath = path.resolve(__dirname, '../../client/src/pages/NotFound.js');
    fs.existsSync.mockReturnValue(true);

    const response = await request(app)
      .get('/non-existent-page')
      .set('Accept', 'text/html'); // Simulate a browser request
    expect(response.status).toBe(404);
    expect(response.text).toContain('404 Not Found Page Content'); // Match mocked content
  });

  it('should log the 404 request', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await request(app).get('/some-non-existent-endpoint');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('404 - Resource not found: GET /some-non-existent-endpoint'));
    warnSpy.mockRestore();
  });
});