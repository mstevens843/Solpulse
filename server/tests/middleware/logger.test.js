// logger middleware logs each request to the console.
const request = require('supertest');
const express = require('express');
const logger = require('../../middleware/logger'); // Path to your logger middleware

const app = express();

// Use the logger middleware in the app
app.use(logger);

// Sample route to test logging
app.get('/test', (req, res) => {
  res.status(200).json({ message: 'Test route' });
});

describe('Logger Middleware', () => {
    it('should log request details', async () => {
      // Mock the console.log method to check if it gets called
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  
      // Make a request to the test route
      const response = await request(app).get('/test');
  
      // Verify that the logger is called with the correct message
      expect(response.status).toBe(200);
      expect(logSpy).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] GET \/test - IP:/)
      );
  
      // Restore the original console.log method
      logSpy.mockRestore();
    });
  
    it('should log request details for different routes and methods', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  
      // Test a POST request
      app.post('/post-test', (req, res) => res.sendStatus(201));
      await request(app).post('/post-test');
  
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('POST /post-test')
      );
  
      // Restore console.log
      logSpy.mockRestore();
    });
  });
  


// Key Features of the Test:
// Mocking console.log: The test mocks console.log so that we can capture the output and verify that the logger is called with the expected parameters.
// Check if logger logs the correct information: After making a request to the test route, we verify that console.log was called and contains relevant information 
// (HTTP method, URL, IP).
// Restoring the Original console.log: After the test runs, we restore the original console.log to avoid affecting other tests or console output in the 
// rest of the application.