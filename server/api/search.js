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
const { User, Post, sequelize, Follower, BlockedUser } = require('../models');
const { Op, literal } = require('sequelize');
const authMiddleware = require('../middleware/auth');
const checkBlockStatus = require('../middleware/checkBlockStatus');
const rateLimiter = require('../middleware/rateLimiter');
const router = express.Router();
const NodeCache = require('node-cache');

// Cache setup for search results (keyed by query + page)
const searchCache = new NodeCache({ stdTTL: 60 }); // Cache expires after 60 seconds

router.get(
  '/',
  rateLimiter(100, 15 * 60 * 1000),
  authMiddleware,
  checkBlockStatus, // Already present
  async (req, res) => {
    const query = req.query.query || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const cacheKey = `search:${query}:${page}:${limit}`;

    // Debugging logs
    console.log(" Incoming search request...");
    console.log(" Authorization Header:", req.headers.authorization || "None");
    console.log(" Decoded req.user:", req.user || "MISSING");
    console.log(" Query:", query, "| Page:", page, "| Limit:", limit);

    const currentUserId = req.user?.id || null;
    if (!currentUserId) {
      console.warn("WARNING: req.user.id is missing in /search route!");
    }

    // Check cache first
    const cached = searchCache.get(cacheKey);
    if (cached) {
      console.log("⚡ Using cached result for:", cacheKey);
      return res.json(cached);
    }

    try {
      //     BLOCKED USER FILTERS
      let blockedUserIds = [];
      let blockedByUserIds = [];
      if (currentUserId) {
        const blocked = await BlockedUser.findAll({
          where: { blockerId: currentUserId },
          attributes: ['blockedId'],
        });
        blockedUserIds = blocked.map(b => b.blockedId);

        const blockedBy = await BlockedUser.findAll({
          where: { blockedId: currentUserId },
          attributes: ['blockerId'],
        });
        blockedByUserIds = blockedBy.map(b => b.blockerId);
      }
      const allBlockedIds = [...new Set([...blockedUserIds, ...blockedByUserIds])];

      // --- 1) Search Users ---
      const users = await User.findAndCountAll({
        where: {
          username: {
            [Op.iLike]: `%${query}%`
          },
          // Filter out blocked or blocking users:
          id: {
            [Op.notIn]: allBlockedIds
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

      // NEW: Get list of following IDs for current user (needed for filtering private posts)
      let followingIds = [];
      if (currentUserId) {
        const followRecords = await Follower.findAll({
          where: { followerId: currentUserId },
          attributes: ['followingId'],
        });
        followingIds = followRecords.map(f => f.followingId);
      }

      // --- 2) Search Posts ---
      const postResults = await Post.findAndCountAll({
        where: {
          content: { [Op.iLike]: `%${query}%` },
        },
        attributes: ['id', 'content', 'createdAt', 'userId'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'profilePicture', 'privacy']
          },
          {
            model: User,
            as: 'likedByUsers',
            attributes: ['id'],
            through: { attributes: [] }
          },
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

      // 1) Filter out any posts by blocked or blocking users
      const unblockedPosts = postResults.rows.filter((post) => {
        if (!post.user) return false;
        return !allBlockedIds.includes(post.user.id);
      });

      // 2) Then filter private posts unless viewer is the author or a follower
      const filteredPosts = unblockedPosts.filter((post) => {
        const postAuthor = post.user;
        if (!postAuthor) return false; // No author? Skip.
        const isPublic = postAuthor.privacy === 'public';
        const isOwner = postAuthor.id === currentUserId;
        const isFollower = followingIds.includes(postAuthor.id);

        // Show if public OR owner OR a follower
        return isPublic || isOwner || isFollower;
      });

      // Format the Post results
      const postFormatted = filteredPosts.map((post) => ({
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        userId: post.userId,
        likeCount: post.likedByUsers?.length || 0,
        repostCount: post.retweetedByUsers?.length || 0,
        commentCount: 0,
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
      console.log("Returning search results successfully.");
      res.json(response);

    } catch (error) {
      console.error('Error fetching search results:', error.message);
      console.error(error.stack);
      res.status(500).json({ error: 'Failed to fetch search results' });
    }
  }
);












//SUGGESTIONS ROUTE (unchanged, except minor rename)
router.get(
  '/suggestions',
  rateLimiter(100, 15 * 60 * 1000),
  authMiddleware,
  checkBlockStatus, // Already present
  async (req, res) => {
    const query = req.query.query || '';
    if (!query.trim()) return res.json({ results: [] });

    // 1) Get currentUserId + following list
    const currentUserId = req.user?.id || null;
    let followingIds = [];
    if (currentUserId) {
      const followRecords = await Follower.findAll({
        where: { followerId: currentUserId },
        attributes: ['followingId'],
      });
      followingIds = followRecords.map(f => f.followingId);
    }

    // Block filter: which users are blocked or blocking me?
    let blockedUserIds = [];
    let blockedByUserIds = [];

    if (currentUserId) {
      const blocked = await BlockedUser.findAll({
        where: { blockerId: currentUserId },
        attributes: ['blockedId'],
      });
      blockedUserIds = blocked.map(b => b.blockedId);

      const blockedBy = await BlockedUser.findAll({
        where: { blockedId: currentUserId },
        attributes: ['blockerId'],
      });
      blockedByUserIds = blockedBy.map(b => b.blockerId);
    }

    const allBlockedIds = [...new Set([...blockedUserIds, ...blockedByUserIds])];

    try {
      // 2) Fetch users, include `privacy`
      const userResults = await User.findAll({
        where: {
          username: { [Op.iLike]: `%${query}%` },
          // Exclude blocked
          id: { [Op.notIn]: allBlockedIds },
        },
        attributes: ['id', 'username', 'email', 'privacy'],
        limit: 5
      });

      // 3) Fetch posts, include user + privacy
      const postResults = await Post.findAll({
        where: {
          content: { [Op.iLike]: `%${query}%` }
        },
        attributes: ['id', 'content', 'userId', 'createdAt'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'profilePicture', 'privacy']
          }
        ],
        limit: 5
      });

      // Filter out posts by blocked or blocking users
      const unblockedPosts = postResults.filter(p => {
        if (!p.user) return false;
        return !allBlockedIds.includes(p.user.id);
      });

      // Then filter out private posts if not allowed
      const visiblePosts = unblockedPosts.filter(p => {
        const author = p.user;
        if (!author) return false;
        if (author.privacy === 'public') return true;
        if (author.id === currentUserId) return true;
        return followingIds.includes(author.id);
      });

      // 4) Format results
      const formattedUsers = userResults.map(user => ({
        id: user.id,
        username: user.username,
        type: 'user',
      }));

      const formattedPosts = visiblePosts.map(post => ({
        id: post.id,
        content: post.content,
        userId: post.userId,
        createdAt: post.createdAt,
        type: 'post',
      }));

      // 5) Combine + return
      const results = [...formattedUsers, ...formattedPosts];
      res.json({ results });

    } catch (error) {
      console.error('Error fetching suggestions:', error);
      res.status(500).json({ error: 'Failed to fetch suggestions' });
    }
  }
);

module.exports = router;