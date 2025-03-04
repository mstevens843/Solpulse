const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const { User } = require('../models/Index');
const validateToken = require('../utils/validateToken');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize'); 


// Helper function to generate JWT token
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

// User Registration Route
router.post(
    '/register',
    [
        check('username', 'Username is required').notEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password, walletAddress } = req.body;

        try {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: 'User already exists' });
            }

            const user = await User.create({ username, email, password, walletAddress });
            const token = generateToken(user);

            res.status(201).json({ token });
        } catch (error) {
            next(error);
        }
    }
);

// User Login Route
router.post(
    '/login',
    [
        check('identifier', 'Please include a valid email or username').notEmpty(),
        check('password', 'Password is required').notEmpty(),
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { identifier, password } = req.body;

        try {
            let user = await User.scope('withPassword').findOne({
                where: {
                    [Op.or]: [
                        { email: identifier },
                        { username: identifier }
                    ]
                }
            });

            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            const token = generateToken(user);
            res.status(200).json({ token, user });
        } catch (error) {
            next(error);
        }
    }
);


// User Logout Route (Clear token from client)
router.post("/logout", (req, res) => {
    res.clearCookie("token"); // Clear the auth cookie
    res.status(200).json({ message: "Logged out successfully" });

    console.log(`User logged out at ${new Date().toISOString()}`);
});

// GET /auth/me
router.get('/me', async (req, res, next) => {
    try {
        const decoded = validateToken(req);
        const user = await User.findByPk(decoded.id, {
            attributes: ['id', 'username', 'email'],
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
});

// DELETE for Testing (Restricted in Production)
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

