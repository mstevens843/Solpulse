/**
 * Authentication Routes for SolPulse API
 *
 * - Handles user registration, login, logout, and authentication checks.
 * - Uses JWT for secure authentication.
 * - Includes validation and error handling.
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const { User } = require('../models');
const validateToken = require('../utils/validateToken');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { rateLimiter } = require('../middleware');



// Placeholder token blocklist (in production use Redis or similar)
const revokedTokens = new Set(); // ✅ Used in logout & middleware in future

// ✅ Rate limiter for login route (5 attempts per 5 minutes)
const loginRateLimiter = rateLimiter({
  limit: 5,
  windowMs: 5 * 60 * 1000,
});


/**
 * Helper function to generate JWT token.
 *
 * - Uses `JWT_SECRET` to sign the token.
 * - Stores user ID and username in the token payload.
 * - Token expires in 2 hours.
 *
 * @param {Object} user - User object containing `id` and `username`.
 * @returns {string} - JWT token.
 */
const generateToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in the environment variables');
    }

    return jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '2h' } // Shortened token expiry
    );
};

/**
 * User Registration Route
 *
 * - Validates input fields before processing.
 * - Checks if the email is already registered.
 * - Hashes password and creates a new user.
 * - Returns a JWT token upon successful registration.
 */
router.post(
  '/register',
  [
    check('username', 'Username is required').notEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, password, walletAddress } = req.body;

    try {
      // ✅ Check if email is already taken
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) return res.status(400).json({ error: 'Email already in use' });

      // ✅ Check if walletAddress is already taken
      const existingWallet = await User.findOne({ where: { walletAddress } });
      if (existingWallet) return res.status(400).json({ error: 'Wallet address already in use' });

      // ✅ DO NOT hash manually — model hook will do it
      const trimmedPassword = password.trim();

      const user = await User.create({
        username,
        email,
        password: trimmedPassword, // Let model hash it
        walletAddress,
      });

      const token = generateToken(user);
      const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({ token, refreshToken, user });
    } catch (error) {
      console.error('❌ Error during registration:', error);
      next(error);
    }
  }
);



/**
 * User Login Route
 *
 * - Accepts either email or username for authentication.
 * - Validates user input.
 * - Compares password with hashed password stored in DB.
 * - Returns JWT token upon successful authentication.
 */
router.post(
  '/login',
  loginRateLimiter,
  [
    check('identifier', 'Please include a valid email or username').notEmpty(),
    check('password', 'Password is required').notEmpty(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { identifier, password } = req.body;
    const trimmedPassword = password.trim(); // ✅ Trim it here

    try {
      const user = await User.scope('withPassword').findOne({
        where: {
          [Op.or]: [{ email: identifier }, { username: identifier }],
        },
      });

      // ✅ Use the trimmed password here
      if (!user || !(await bcrypt.compare(trimmedPassword, user.password))) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const token = generateToken(user);
      const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.status(200).json({
        token,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture || null, // ✅ add this!
        },
      });
    } catch (error) {
      next(error);
    }
  }
);


/**
 * User Logout Route
 *
 * - Clears authentication token from client.
 * - Logs user logout event.
 */
router.post('/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
  
    // ✅ Revoke token if it's present (placeholder logic)
    if (token) {
      revokedTokens.add(token);
      console.log(`Token revoked: ${token}`);
    }
  
    res.status(200).json({ message: 'Logged out successfully' });
  });


/**
 * Get Current User Route
 *
 * - Decodes JWT token to retrieve user data.
 * - Fetches user details from DB.
 */

router.get('/me', async (req, res, next) => {
    try {
        const decoded = validateToken(req);
        const user = await User.findByPk(decoded.id, {
          attributes: ['id', 'username', 'email', 'profilePicture'], // ✅ Added profilePicture
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
});


/**
 * Delete User Route (For Testing Only)
 *
 * - Allows deleting users **only in non-production environments**.
 * - Requires a valid email to delete an account.
 */

router.post('/auth/delete', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'This route is disabled in production.' });
    }

    const { email } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.destroy();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;



/**
 * 🔍 Potential Issues & Optimizations
1️⃣ Password is Stored in Plaintext in /register
Issue: The password is stored directly without hashing.
✅ Fix: Hash the password before saving:
const hashedPassword = await bcrypt.hash(password, 10);
const user = await User.create({ username, email, password: hashedPassword, walletAddress });

2️⃣ No Refresh Token Implementation
Issue: If the access token expires, the user has to re-login.
✅ Fix: Implement refresh tokens for better UX:
const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
res.status(200).json({ token, refreshToken, user });

3️⃣ No Rate Limiting on Login Route
Issue: Brute-force attacks could exploit the login endpoint.
✅ Fix: Use a stricter rate limiter for /login:
const loginRateLimiter = rateLimiter({ limit: 5, windowMs: 5 * 60 * 1000 });
router.post('/login', loginRateLimiter, loginHandler);

4️⃣ No Account Verification (Email Confirmation)
Issue: Users can register with fake emails since no verification is required.
✅ Fix: Implement an email verification step before allowing login.

5️⃣ Insecure Logout Handling
Issue: Clearing a cookie is not sufficient if using JWT in local storage.
✅ Fix: Add token revocation by maintaining a blocklist of revoked tokens in Redis.
 */