/**
 * Ownership Middleware for SolPulse
 * 
 * - Ensures users can only modify or delete their own posts or comments. 
 * - Dynamically detects whether the request is for a post or comment.
 * - Returns appropriate HTTP errors for unat
 */


const { Post, Comment } = require('../models');


const checkOwnership = async (req, res, next) => {
    try {
        if (!req.params || !req.params.id) {
            return res.status(400).json({ error: 'Invalid request. No ID provided.' });
        }

        const { id } = req.params;

        if (req.originalUrl.includes('/comments')) {
            const comment = await Comment.findByPk(id);
            if (!comment) {
                return res.status(404).json({ error: 'Comment not found' });
            }
            if (comment.userId !== req.user.id) {
                return res.status(403).json({ error: 'Unauthorized to delete this comment' });
            }
            req.comment = comment;
        } else if (req.originalUrl.includes('/posts')) {
            const post = await Post.findByPk(id);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }
            if (post.userId !== req.user.id) {
                return res.status(403).json({ error: 'Unauthorized to delete this post' });
            }
            req.post = post;
        }

        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        console.error('Error in checkOwnership middleware:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = checkOwnership;