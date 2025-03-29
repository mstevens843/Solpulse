/**
 *  Search API - SolPulse
 * 
 * Handles:
 * - Searching users by username or email.
 * - Searching posts by content.
 * - Pagination for optimized performance.
 * - Rate limiting to prevent abuse.
 */

const express = require('express');
const { User, Post, sequelize } = require('../models/Index');
const { Op, literal } = require('sequelize');
const authMiddleware = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');
const router = express.Router();
const NodeCache = require('node-cache');

// Cache setup for search results (keyed by query + page)
const searchCache = new NodeCache({ stdTTL: 60 }); // Cache expires after 60 seconds

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

router.get(
  '/',
  rateLimiter(100, 15 * 60 * 1000),
  authMiddleware,
  async (req, res) => {
    const query = req.query.query || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const cacheKey = `search:${query}:${page}:${limit}`;

    // ✅ Suggestion 3: Check Cache First
    const cached = searchCache.get(cacheKey);
    if (cached) return res.json(cached);

    try {
      // ✅ Suggestion 1: Use PostgreSQL Full-Text Search (tsvector)
      const userResults = await User.findAndCountAll({
        where: literal(
          `to_tsvector('english', username || ' ' || email) @@ plainto_tsquery('english', ${sequelize.escape(
            query
          )})`
        ),
        attributes: ['id', 'username', 'email'],
        limit,
        offset,
      });

      const postResults = await Post.findAndCountAll({
        where: literal(
          `to_tsvector('english', content) @@ plainto_tsquery('english', ${sequelize.escape(
            query
          )})`
        ),
        attributes: ['id', 'content', 'createdAt', 'userId'],
        limit,
        offset,
      });

      const results = formatSearchResults(userResults.rows, postResults.rows);
      const response = {
        results,
        userCount: userResults.count,
        postCount: postResults.count,
        totalResults: userResults.count + postResults.count,
        currentPage: page,
        totalPages: Math.ceil((userResults.count + postResults.count) / limit),
      };

      // ✅ Cache the results
      searchCache.set(cacheKey, response);

      res.json(response);
    } catch (error) {
      console.error('Error fetching search results:', error);
      res.status(500).json({ error: 'Failed to fetch search results' });
    }
  }
);

module.exports = router;


/**
 * Potential Issues & Optimizations
Performance Optimization:
Using LIKE for text search can be slow on large datasets. PostgreSQL’s tsvector Full-Text Search would improve speed.

Security Concern:
Right now, unauthenticated users can search all users and posts. Consider restricting visibility for private profiles.

Reduce Database Load:
Since searches query both users and posts separately, adding caching (Redis) for frequent search terms could improve performance.

 */