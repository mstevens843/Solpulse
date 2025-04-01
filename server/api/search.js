/**
 *  Search API - SolPulse
 * 
 * Handles:
 * - Searching users by username or email.
 * - Searching posts by content.
 * - Pagination for optimized performance.
 * - Rate limiting to prevent abuse.
 */

/**
 *  Search API - SolPulse
 *
 * Handles:
 * - Searching users by username or email.
 * - Searching posts by content (full-text search).
 * - Pagination + caching for performance.
 * - Rate limiting to prevent abuse.
 */

const express = require('express');
const { User, Post, sequelize, Follower } = require('../models/Index');
const { Op, literal } = require('sequelize');
const authMiddleware = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');
const router = express.Router();
const NodeCache = require('node-cache');

// Cache setup for search results (keyed by query + page)
const searchCache = new NodeCache({ stdTTL: 60 }); // Cache expires after 60 seconds

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

    // Debugging logs
    console.log("🧠 Incoming search request...");
    console.log("🧠 Authorization Header:", req.headers.authorization || "None");
    console.log("🧠 Decoded req.user:", req.user || "MISSING");
    console.log("🧠 Query:", query, "| Page:", page, "| Limit:", limit);

    const currentUserId = req.user?.id || null;
    if (!currentUserId) {
      console.warn("⚠️ WARNING: req.user.id is missing in /search route!");
    }

    // Check cache first
    const cached = searchCache.get(cacheKey);
    if (cached) {
      console.log("⚡ Using cached result for:", cacheKey);
      return res.json(cached);
    }

    try {
      // --- 1) Search Users ---
      const users = await User.findAndCountAll({
        where: {
          username: {
            [Op.iLike]: `%${query}%`
          }
        },
        attributes: ['id', 'username', 'profilePicture', 'bio'],
        limit,
        offset,
      });

      // Enrich with "isFollowedByCurrentUser" + "isFollowingYou"
      const enrichedUsers = await Promise.all(
        users.rows.map(async (user) => {
          let isFollowedByCurrentUser = false;
          let isFollowingYou = false;

          if (currentUserId) {
            const [followed, followsYou] = await Promise.all([
              Follower.findOne({
                where: {
                  followerId: currentUserId,
                  followingId: user.id,
                },
              }),
              Follower.findOne({
                where: {
                  followerId: user.id,
                  followingId: currentUserId,
                },
              }),
            ]);

            isFollowedByCurrentUser = !!followed;
            isFollowingYou = !!followsYou;
          }

          return {
            id: user.id,
            username: user.username,
            profilePicture: user.profilePicture,
            bio: user.bio,
            isFollowedByCurrentUser,
            isFollowingYou,
            type: 'user',
          };
        })
      );

      // --- 2) Search Posts with Full Text (to_tsvector) ---
      const postResults = await Post.findAndCountAll({
        where: {
          content: {
            [Op.iLike]: `%${query}%`
          }
        },
        attributes: ['id', 'content', 'createdAt', 'userId'],
        include: [
          // Must match your Post model's 'as: "user"' association
          { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'username', 'profilePicture'] 
          },
          // Must match Post model's many-to-many as: 'likedByUsers'
          { 
            model: User, 
            as: 'likedByUsers', 
            attributes: ['id'], 
            through: { attributes: [] } 
          },
          // Must match Post model's many-to-many as: 'retweetedByUsers'
          { 
            model: User, 
            as: 'retweetedByUsers', 
            attributes: ['id'], 
            through: { attributes: [] } 
          },
        ],
        limit,
        offset,
      });

      // Format the Post results
      const postFormatted = postResults.rows.map((post) => ({
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        userId: post.userId,
        likeCount: post.likedByUsers?.length || 0,
        repostCount: post.retweetedByUsers?.length || 0,
        commentCount: 0,
        // ↪️ Instead of an object in "author"
        authorName: post.user?.username || null,
        authorAvatar: post.user?.profilePicture || null,
        type: 'post',
      }));
      

      // Combine user + post results
      const results = [...enrichedUsers, ...postFormatted];

      // Build final response
      const response = {
        results,
        userCount: users.count,
        postCount: postResults.count,
        totalResults: users.count + postResults.count,
        currentPage: page,
        totalPages: Math.ceil((users.count + postResults.count) / limit),
      };

      // Cache it and return
      searchCache.set(cacheKey, response);
      console.log("✅ Returning search results successfully.");
      res.json(response);
    } catch (error) {
      console.error('🔥 Error fetching search results:', error.message);
      console.error(error.stack);
      res.status(500).json({ error: 'Failed to fetch search results' });
    }
  }
);

// -------------------------------------------------------------------
//           SUGGESTIONS ROUTE (unchanged, except minor rename)
// -------------------------------------------------------------------
router.get(
  '/suggestions',
  rateLimiter(100, 15 * 60 * 1000),
  authMiddleware,
  async (req, res) => {
    const query = req.query.query || '';
    if (!query.trim()) return res.json({ results: [] });

    try {
      const userResults = await User.findAll({
        where: {
          username: {
            [Op.iLike]: `%${query}%`
          }
        },
        attributes: ['id', 'username', 'email'],
        limit: 5
      });

      const postResults = await Post.findAll({
        where: {
          content: {
            [Op.iLike]: `%${query}%`
          }
        },
        attributes: ['id', 'content', 'userId', 'createdAt'],
        limit: 5
      });

      const results = [
        ...userResults.map(user => ({
          id: user.id,
          username: user.username,
          type: 'user',
        })),
        ...postResults.map(post => ({
          id: post.id,
          content: post.content,
          userId: post.userId,
          createdAt: post.createdAt,
          type: 'post',
        }))
      ];

      res.json({ results });
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      res.status(500).json({ error: 'Failed to fetch suggestions' });
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