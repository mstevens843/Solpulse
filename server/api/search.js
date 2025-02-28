const express = require('express');
const { User, Post } = require('../models/Index');
const { Op } = require('sequelize');
const authMiddleware = require('../middleware/auth'); // Optional authentication middleware
const rateLimiter = require('../middleware/rateLimiter'); // Import rate-limiting middleware

const router = express.Router();

/**
 * Utility function to format search results
 * @param {Array} users - User search results
 * @param {Array} posts - Post search results
 * @returns {Array} - Combined formatted results
 */
const formatSearchResults = (users, posts) => {
  return [
    ...users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      type: 'user',
    })),
    ...posts.map((post) => ({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      userId: post.userId,
      type: 'post',
    })),
  ];
};

/**
 * @route   GET /api/search
 * @desc    Search users and posts by query with pagination
 * @access  Public
 */
router.get(
  '/',
  rateLimiter(100, 15 * 60 * 1000), // Limit to 100 requests per 15 minutes
  authMiddleware,
  async (req, res) => {
    const query = req.query.query || ''; // Get the search query from the request
    const page = parseInt(req.query.page) || 1; // Pagination: current page
    const limit = parseInt(req.query.limit) || 10; // Pagination: results per page
    const offset = (page - 1) * limit;

    try {
      // Search users by username or email
      const userResults = await User.findAndCountAll({
        where: {
          [Op.or]: [
            { username: { [Op.like]: `%${query}%` } },
            { email: { [Op.like]: `%${query}%` } },
          ],
        },
        attributes: ['id', 'username', 'email'], // Return specific attributes
        limit,
        offset,
      });

      // Search posts by content
      const postResults = await Post.findAndCountAll({
        where: {
          content: { [Op.like]: `%${query}%` },
        },
        attributes: ['id', 'content', 'createdAt', 'userId'], // Return specific attributes
        limit,
        offset,
      });

      // Combine both results
      const results = formatSearchResults(userResults.rows, postResults.rows);

      res.json({
        results,
        userCount: userResults.count,
        postCount: postResults.count,
        totalResults: userResults.count + postResults.count,
        currentPage: page,
        totalPages: Math.ceil((userResults.count + postResults.count) / limit),
      });
    } catch (error) {
      console.error('Error fetching search results:', error);
      res.status(500).json({ error: 'Failed to fetch search results' });
    }
  }
);

module.exports = router;