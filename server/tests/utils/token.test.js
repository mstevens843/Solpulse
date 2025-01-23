const { generateToken, verifyToken, decodeToken } = require('../utils/token');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Mock environment variables
dotenv.config = jest.fn().mockReturnValue({
  JWT_SECRET: 'secretkey', // Mock JWT secret
});

// Mock JWT functions
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
}));

describe('Token Utility Functions', () => {
    describe('generateToken', () => {
        it('should generate a valid JWT token', () => {
            const payload = { id: 1, username: 'testuser' };
            const token = 'mockToken';
            jwt.sign.mockReturnValue(token);

            const result = generateToken(payload);
            expect(result).toBe(token);
            expect(jwt.sign).toHaveBeenCalledWith(payload, 'secretkey', { expiresIn: '1h' });
        });

        it('should throw an error if JWT_SECRET is not defined', () => {
            process.env.JWT_SECRET = undefined;
            const payload = { id: 1, username: 'testuser' };

            expect(() => generateToken(payload)).toThrow('JWT_SECRET is not defined in the environment variables');
        });
    });

    describe('verifyToken', () => {
        it('should successfully verify a valid token', () => {
            const token = 'validToken';
            const decoded = { id: 1, username: 'testuser' };
            jwt.verify.mockReturnValue(decoded);

            const result = verifyToken(token);
            expect(result).toEqual(decoded);
            expect(jwt.verify).toHaveBeenCalledWith(token, 'secretkey');
        });

        it('should throw an error for expired tokens', () => {
            const token = 'expiredToken';
            const error = new Error('Token expired');
            error.name = 'TokenExpiredError';
            jwt.verify.mockImplementation(() => { throw error });

            expect(() => verifyToken(token)).toThrow('Token has expired');
        });

        it('should throw an error for invalid tokens', () => {
            const token = 'invalidToken';
            const error = new Error('Invalid token');
            error.name = 'JsonWebTokenError';
            jwt.verify.mockImplementation(() => { throw error });

            expect(() => verifyToken(token)).toThrow('Invalid token');
        });

        it('should throw a generic error for unknown verification issues', () => {
            const token = 'unknownErrorToken';
            const error = new Error('Unknown verification error');
            jwt.verify.mockImplementation(() => { throw error });

            expect(() => verifyToken(token)).toThrow('Token verification failed');
        });
    });

    describe('decodeToken', () => {
        it('should decode a valid token', () => {
            const token = 'validToken';
            const decoded = { id: 1, username: 'testuser' };
            jwt.decode.mockReturnValue(decoded);

            const result = decodeToken(token);
            expect(result).toEqual(decoded);
        });

        it('should return null for invalid tokens', () => {
            const token = 'invalidToken';
            jwt.decode.mockImplementation(() => { throw new Error('Decode error') });

            const result = decodeToken(token);
            expect(result).toBeNull();
        });
    });
});


// Explanation of Tests:
// generateToken Tests:
// Checks if the function generates a token when the JWT_SECRET is set.
// Ensures it throws an error if JWT_SECRET is undefined.
// verifyToken Tests:
// Tests valid token verification.
// Simulates errors for expired tokens, invalid tokens, and unknown errors.
// decodeToken Tests:
// Verifies that the function can decode a valid token.
// Handles errors by returning null when the token cannot be decoded.
// Next Steps:
// Place the token.test.js file under your __tests__ folder or equivalent.
// Run jest to make sure the tests pass and that the token utility is working as expected.