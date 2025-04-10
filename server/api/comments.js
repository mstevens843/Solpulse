/**
 * Comment Routes for SolPulse API
 *
 * - Manages user comments on posts.
 * - Includes WebSocket support for real-time comment updates.
 * - Implements validation, ownership checks, and notifications.
 */

const express = require('express');
const { Comment, Notification, Post, User } = require('../models/Index');
const authMiddleware = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const checkCommentOwnership = require('../middleware/checkCommentOwnership');
const checkBlockStatus = require('../middleware/checkBlockStatus');


const router = express.Router();

const defaultAvatarUrl = process.env.DEFAULT_AVATAR_URL || 'https://your-fallback-url.com/default.png';


/**
 * WebSocket instance for broadcasting comment events.
 * - Allows real-time updates for new, updated, and deleted comments.
 */
let io;
const setSocket = (socketInstance) => {
    io = socketInstance;
    console.log('WebSocket server for comments initialized.');
};

/**
 * Broadcast comment events via WebSocket.
 * 
 * - Ensures WebSocket is initialized before emitting events.
 * - Structures event data before broadcasting.
 */
const handleCommentEvent = (event, payload) => {
    if (!io) {
        console.error('WebSocket instance is not initialized.');
        return;
    }

    const eventData = {
        id: payload.id,
        postId: payload.postId,
        userId: payload.userId,
        content: payload.content,
        createdAt: payload.createdAt,
        updatedAt: payload.updatedAt,
        author: payload.author || 'Anonymous',
        avatarUrl: payload.avatarUrl || null,
    };

    io.emit(event, eventData);
    console.log(`Comment event '${event}' broadcasted with payload:`, eventData);
};

/**
 * Helper function to format validation errors.
 */
const handleValidationErrors = (errors) => {
    return errors.array().map((err) => ({ field: err.param, message: err.msg }));
};



/**
 * Fetch detailed comments on posts created by the logged-in user.
 *
 * - Supports pagination.
 * - Includes comment author information.
 */
router.get('/detailed', authMiddleware, checkBlockStatus, async (req, res) => {
    const { page = 1 } = req.query;
  
    const limit = 10;
    const offset = (page - 1) * limit;
  
    try {
      const userId = req.user.id;
      console.log('Fetching comments for posts owned by user:', userId);
  
      // Step 1: Get post IDs the user owns
      const userPosts = await Post.findAll({
        where: { userId },
        attributes: ['id'],
      });
  
      if (!userPosts.length) {
        return res.status(404).json({ error: 'No posts found for this user.' });
      }
  
      const postIds = userPosts.map((post) => post.id);
  
      // Step 2: Find all unread comment notifications linked to this user's posts
      const unreadNotifications = await Notification.findAll({
        where: {
          userId,
          type: 'comment',
          isRead: false,
        },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        include: [
          {
            model: User,
            as: 'actor',
            attributes: ['username', 'profilePicture'],            
        },
        ],
      });
  
      if (!unreadNotifications.length) {
        return res.status(200).json({
          comments: [],
          totalComments: 0,
          totalPages: 0,
          currentPage: parseInt(page),
        });
      }
  
      // Step 3: Format the response to match existing shape
      const formatted = unreadNotifications.map((notif) => ({
        id: notif.id,
        actor: notif.actor?.username || 'Unknown',
        message: notif.message || 'commented on your post',
        content: notif.content || null,
        createdAt: notif.createdAt,
        isRead: notif.isRead ?? false,
        profilePicture: notif.actor?.profilePicture || null, // ✅ ADD THIS
      }));
  
      // Step 4: Count all unread comment notifs for this user for pagination
      const total = await Notification.count({
        where: {
          userId,
          type: 'comment',
          isRead: false,
        },
      });
  
      res.status(200).json({
        comments: formatted,
        totalComments: total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
      });
    } catch (err) {
      console.error('❌ Sequelize error in /comments/detailed:', err.message);
      res.status(500).json({ error: 'Failed to fetch comment notifications.' });
    }
  });
/**
 * Fetch total comment count for a post.
 * This needs to come first to ensure `/count` is not overridden by `/comments/:id`.
 */
router.get('/count', checkBlockStatus, async (req, res) => {
    const { postId } = req.query;

    if (!postId) {
        return res.status(400).json({ error: 'Post ID is required' });
    }

    try {
        const commentCount = await Comment.count({
            where: { postId },
        });

        res.status(200).json({ count: commentCount });
    } catch (error) {
        console.error('Error fetching comment count:', error);
        res.status(500).json({ error: 'Failed to fetch comment count' });
    }
});


/**
 * Optimization Route 🚀
 *
 * @route   POST /api/comments/batch-count
 * @desc    Returns comment counts for multiple postIds in a single request.
 * @reason  This route significantly reduces the number of API calls needed
 *          when displaying comment counts across multiple posts (e.g., in the
 *          profile feed or homepage). Instead of sending 20+ individual requests,
 *          the frontend can now send one batch request — improving performance,
 *          reducing rate limit issues, and enhancing scalability.
 * added:
 * Allows empty postIds without throwing 400.

Ensures consistent response shape: counts: [{ postId, count }].

 * @access  Public
 */
router.post('/batch-count', checkBlockStatus, async (req, res) => {
    const { postIds } = req.body;

    // ✅ Improved validation
    if (!Array.isArray(postIds)) {
        return res.status(400).json({ error: 'postIds must be an array' });
    }

    // ✅ Allow empty arrays and return empty counts instead of 400
    if (postIds.length === 0) {
        return res.status(200).json({ counts: [] });
    }

    try {
        const counts = await Comment.findAll({
            attributes: [
                'postId',
                [Comment.sequelize.fn('COUNT', Comment.sequelize.col('id')), 'count'],
            ],
            where: { postId: postIds },
            group: ['postId'],
        });

        const countMap = {};
        postIds.forEach(id => {
            countMap[id] = 0; // default to 0
        });

        counts.forEach(({ postId, dataValues }) => {
            countMap[postId] = parseInt(dataValues.count, 10);
        });

        // ✅ Format returned as expected by frontend
        const formatted = Object.entries(countMap).map(([postId, count]) => ({
            postId: parseInt(postId, 10),
            count,
        }));

        res.status(200).json({ counts: formatted });
    } catch (error) {
        console.error('Error fetching batch comment counts:', error);
        res.status(500).json({ error: 'Failed to fetch comment counts.' });
    }
});


/**
 * Fetch comments for a specific post with pagination.
 */
router.get('/', authMiddleware, checkBlockStatus, async (req, res) => {
    const { postId, page = 1, limit = 20 } = req.query;

  // Validate the postId
  if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
  }

  try {
      // Find the post to ensure it exists
      const post = await Post.findByPk(postId);

      if (!post) {
          return res.status(404).json({ error: 'Post not found' });
      }

      // Calculate offset for pagination
      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

      // Fetch comments with pagination
      const comments = await Comment.findAndCountAll({
        where: { postId },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit, 10),
        offset,
        attributes: ['id', 'content', 'userId', 'postId', 'createdAt'], // ✅ here
        include: [
          {
            model: User,
            as: 'commentAuthor',
            attributes: ['username', 'profilePicture'],
          },
        ],
      });

      res.status(200).json({
          comments: comments.rows, // Paginated comments
          totalComments: comments.count, // Total number of comments
          page: parseInt(page, 10), // Current page
          pages: Math.ceil(comments.count / limit), // Total pages
      });
  } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

/*
 * Add a new comment to a post.
 */
router.post(
    '/',
    [
        authMiddleware,
        checkBlockStatus, // 🛡️ Prevent blocked users from commenting
        check('content', 'Content is required').notEmpty(),
        check('postId', 'Post ID is required').notEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: handleValidationErrors(errors) });
        }

        const { postId, content } = req.body;

        try {
            const post = await Post.findByPk(postId);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            // Create the new comment
            const comment = await Comment.create({
                userId: req.user.id,
                postId,
                content,
            });

            // Fetch user details to ensure `author` and `avatarUrl` are correct
            const user = await User.findByPk(req.user.id, {
                attributes: ["username", "profilePicture"],
            });

            const formattedComment = {
                ...comment.toJSON(),
                author: user ? user.username : "Unknown",
                avatarUrl: user ? user.profilePicture || defaultAvatarUrl : defaultAvatarUrl,

            };

            // Notify the post owner
            await Notification.create({
                userId: post.userId,
                actorId: req.user.id,
                type: 'comment',
                message: `${user ? user.username : "Unknown"} commented on your post.`,
                isRead: false,
            });

            // Broadcast the new comment event to WebSocket
            handleCommentEvent('new-comment', formattedComment);

            //  Send the correct response to the frontend
            res.status(201).json({
                message: "Comment added successfully!",
                comment: formattedComment,
            });

        } catch (error) {
            console.error('Error adding comment:', error);
            res.status(500).json({ error: 'Failed to add comment' });
        }
    }
);

/**
 * Delete a comment.
 * Placed after `/comments/:id` to ensure no conflict with `/comments/count`.
 */
router.delete('/:id', authMiddleware, checkCommentOwnership, async (req, res) => {
    try {
        await req.comment.destroy();
        handleCommentEvent('delete-comment', req.comment);
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

module.exports = { router, setSocket };



/**
 * 🔍 Potential Issues & Optimizations
1️⃣ No WebSocket Authentication

Issue: Any client can receive WebSocket events.
✅ Fix: Implement WebSocket authentication using JWT before broadcasting messages.
2️⃣ Default Avatar URLs Should Be Dynamic

Issue: Hardcoded /default-avatar.png may not work if deployed.
✅ Fix: Store the URL in environment variables or database settings.
3️⃣ No Soft Delete for Comments

Issue: Deleted comments are permanently removed.
✅ Fix: Implement a soft delete mechanism (e.g., isDeleted: true).

 */