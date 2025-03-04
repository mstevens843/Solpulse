const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/test
 * @desc    Simple test route to check route registration
 * @access  Public
 */
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Test route is working!' });
});

module.exports = router;
