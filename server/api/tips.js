const express = require('express');
const { Tip, User } = require('../models/Index'); // Assuming `User` model exists for including user details
const authMiddleware = require('../middleware/auth'); // JWT authentication middleware
const { check, validationResult } = require('express-validator'); // Validation middleware
const router = express.Router();

/**
 * Utility function to format tips for consistent API responses
 */
const formatTips = (tips) => {
    return tips.map((tip) => ({
        id: tip.id,
        fromUserId: tip.fromUserId,
        toUserId: tip.toUserId,
        amount: tip.amount,
        message: tip.message,
        createdAt: tip.createdAt,
        fromUser: tip.fromUser ? { id: tip.fromUser.id, username: tip.fromUser.username } : null,
        toUser: tip.toUser ? { id: tip.toUser.id, username: tip.toUser.username } : null,
    }));
};

/**
 * @route   POST /api/tips
 * @desc    Send a tip to another user
 * @access  Private
 */
router.post(
    '/',
    authMiddleware,
    [
        check('toUserId', 'Recipient ID is required').not().isEmpty(),
        check('amount', 'Amount must be greater than 0').isFloat({ gt: 0 }),
        check('message', 'Message is optional but cannot exceed 255 characters').optional().isLength({ max: 255 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { toUserId, amount, message } = req.body;

        try {
            const sender = await User.findByPk(req.user.id);
            const recipient = await User.findByPk(toUserId);

            if (!recipient || !recipient.walletAddress) {
                return res.status(404).json({ error: 'Recipient wallet address not found.' });
            }

            if (!sender.walletAddress) {
                return res.status(400).json({ error: 'Your wallet address is not set. Please update your wallet in settings.' });
            }

            // Simulate sending the tip via blockchain (replace with actual blockchain transaction)
            console.log(`Sending ${amount} SOL from ${sender.walletAddress} to ${recipient.walletAddress}`);

            // Save tip to the database
            const tip = await Tip.create({
                fromUserId: sender.id,
                toUserId: recipient.id,
                amount,
                message: message || null,
            });

            res.status(201).json({ 
                tip, 
                message: `Tip of ${amount} SOL sent successfully to ${recipient.username}!` 
            });
        } catch (err) {
            console.error('Error sending tip:', err);
            res.status(500).json({ error: 'Failed to send tip. Please try again later.' });
        }
    }
);

/**
 * @route   GET /api/tips/received
 * @desc    Get tips received by the authenticated user with pagination
 * @access  Private
 */
router.get('/received', authMiddleware, async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const { count, rows } = await Tip.findAndCountAll({
            where: { toUserId: req.user.id },
            include: [{ model: User, as: 'fromUser', attributes: ['id', 'username'] }], // Include sender details
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json({
            tips: formatTips(rows),
            totalReceived: count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
        });
    } catch (err) {
        console.error('Error fetching received tips:', err);
        res.status(500).json({ error: 'Failed to fetch received tips.' });
    }
});

/**
 * @route   GET /api/tips/sent
 * @desc    Get tips sent by the authenticated user with pagination
 * @access  Private
 */
router.get('/sent', authMiddleware, async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const { count, rows } = await Tip.findAndCountAll({
            where: { fromUserId: req.user.id },
            include: [{ model: User, as: 'toUser', attributes: ['id', 'username'] }], // Include recipient details
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json({
            tips: formatTips(rows),
            totalSent: count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
        });
    } catch (err) {
        console.error('Error fetching sent tips:', err);
        res.status(500).json({ error: 'Failed to fetch sent tips.' });
    }
});

module.exports = router;


// Key Improvements:
// Validation:

// Added express-validator to validate input fields when sending a tip (toUserId, amount, and message).
// Pagination:

// Implemented pagination for received and sent tips endpoints using page and limit query parameters.
// Consistent Formatting:

// Introduced formatTips utility function to structure API responses consistently.
// Included fromUser and toUser details (e.g., id, username) for better context in the responses.
// Error Handling:

// Improved error messages and response status codes.
// Added validation error messages for user input issues.
// Additional Metadata:

// Response for paginated endpoints includes metadata like totalReceived, totalSent, currentPage, and totalPages.
