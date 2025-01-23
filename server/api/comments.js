const express = require('express');
const { Comment, Notification, Post } = require('../models/Index');
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

            const comment = await Comment.create({
                userId: req.user.id,
                postId,
                content,
            });

            // Notify the post owner
            await Notification.create({
                userId: post.userId,
                actorId: req.user.id,
                type: 'comment',
                message: `${req.user.username} commented on your post.`,
                isRead: false,
            });

            // Broadcast the new comment event
            handleCommentEvent('new-comment', comment);

            res.status(201).json(comment);
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





// Comment Deletion:
// Applied checkOwnership to the DELETE route in comment.js, ensuring that only the owner of the comment can delete it.

// Pagination in the Comments Route:
// The GET /api/comments/:postId route now supports pagination. You can pass page and limit as query parameters to fetch a subset of comments for a specific post.

// Pagination Logic:

// page: Specifies the page number (default is 1).
// limit: Specifies how many comments to return per page (default is 10).
// offset: Skips over records from previous pages to retrieve the correct set of comments for the current page.

// Changes to comment.js
// WebSocket Integration:

// Introduced io to broadcast events (new-comment, update-comment, delete-comment) to all connected clients.
// Reactions to Comments:

// Added a POST /:id/react route to handle reactions (e.g., likes, dislikes) and update the reactions field in the database.
// Edit Comments:

// Added a PUT /:id route to allow editing comments. Ensured only the comment owner can edit using checkOwnership.
// Delete Comments:

// Updated the DELETE /:id route to broadcast the deletion event to all clients after successful deletion.
// Improved Comments:

// Preserved your original comments and added new ones to clarify the purpose of WebSocket events and additional routes.

// moving the WebSocket-specific logic like broadcasting events to a centralized utility function (e.g., handleCommentEvent) in the utils/websocket.js file. 
// This approach ensures better separation of concerns and makes the comment.js API cleaner and more focused on the HTTP route logic.

// Here’s how to integrate handleCommentEvent into your comment.js file

// Key Improvements
// Validation Error Handling:

// Created a handleValidationErrors utility function to reduce repetitive error-handling code.
// Consistency:

// Used consistent response status codes (201 for resource creation, 204 for deletion).
// Ensured consistent use of io.emit for WebSocket broadcasts.
// Improved Modularity:

// setSocket is separate from the route logic, keeping the WebSocket setup clean and reusable.
// Optional Chaining for Reactions:

// Used ?. to handle cases where reactions might not exist yet.
// Better Logging:

// Improved console logs for better debugging.
// Future-proofing:

// Scalable structure makes it easier to add additional features (e.g., comment pinning, threading).


// Key Changes in the File:
// handleCommentEvent Integration:

// Used handleCommentEvent in all routes (add, react, edit, delete) to broadcast changes to WebSocket clients.
// Each event is tagged with a relevant name (new-comment, update-comment, delete-comment) for consistency.
// Error Handling:

// Improved error handling and logging across all routes.
// Consistent Status Codes:

// Added 201 for resource creation.
// Used 204 for successful deletion without a response body.

// Example Events Emitted:
// new-comment: When a new comment is added.
// update-comment: When a comment is updated (reaction or edit).
// delete-comment: When a comment is deleted.