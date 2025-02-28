const express = require('express');
const { Comment, Notification, Post, User } = require('../models/Index');
const authMiddleware = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const checkCommentOwnership = require('../middleware/checkCommentOwnership');

const router = express.Router();

/**
 * Set WebSocket instance for comment events.
 * @param {Object} socketInstance - The WebSocket server instance.
 */
let io;
const setSocket = (socketInstance) => {
    io = socketInstance;
    console.log('WebSocket server for comments initialized.');
};

/**
 * Handle comment events for WebSocket clients.
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
 * Handle validation errors.
 */
const handleValidationErrors = (errors) => {
    return errors.array().map((err) => ({ field: err.param, message: err.msg }));
};

// *** Route Definitions in Correct Order ***


router.get('/detailed', authMiddleware, async (req, res) => {
    const { page = 1 } = req.query;
    
    const limit = 10;  // Fixed pagination limit
    const offset = (page - 1) * limit;
  
    try {
      console.log('Fetching comments on posts for user:', req.user.id);
  
      // Step 1: Find all posts created by the logged-in user
      const userPosts = await Post.findAll({
        where: { userId: req.user.id },
        attributes: ['id'],
      });
  
      if (!userPosts.length) {
        return res.status(404).json({ error: 'No posts found for this user.' });
      }
  
      // Extract post IDs
      const postIds = userPosts.map(post => post.id);
  
      // Step 2: Find comments on the user's posts
      const { count, rows } = await Comment.findAndCountAll({
        where: { postId: postIds },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });
  
      if (!rows.length) {
        return res.status(404).json({ error: 'No comments found on your posts.' });
      }
  
      res.json({
        comments: rows.map((comment) => ({
          id: comment.id,
          author: comment.user?.username || `User ${comment.user?.id || 'unknown'}`,
          content: comment.content,
          createdAt: comment.createdAt,
        })),
        totalComments: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
      });
    } catch (err) {
      console.error('Error fetching detailed comments:', err);
      res.status(500).json({ error: 'Failed to fetch comments.' });
    }
  });
  
  
/**
 * Fetch total comment count for a post.
 * This needs to come first to ensure `/count` is not overridden by `/comments/:id`.
 */
router.get('/count', async (req, res) => {
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
 * Fetch comments for a specific post with pagination.
 */
router.get('/', authMiddleware, async (req, res) => {
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

/**
 * Add a new comment to a post.
 */
/**
 * Add a new comment to a post.
 */
router.post(
    '/',
    [
        authMiddleware,
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
                avatarUrl: user ? user.profilePicture || "http://localhost:5001/uploads/default-avatar.png" : "http://localhost:5001/uploads/default-avatar.png",
            };

            // Notify the post owner
            await Notification.create({
                userId: post.userId,
                actorId: req.user.id,
                type: 'comment',
                message: `${user ? user.username : "Unknown"} commented on your post.`,
                isRead: false,
            });

            // ✅ Broadcast the new comment event to WebSocket
            handleCommentEvent('new-comment', formattedComment);

            // ✅ Send the correct response to the frontend
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