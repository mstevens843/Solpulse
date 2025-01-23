// This middleware function checks if the post exists and if the user owns the post. If the user is not the owner, 
// it responds with the 403 error. 
// Use this middleware in the followowing files. (post.js)
const { Post, Comment } = require('../models/Index'); // Import both models

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



// Error Logging: Add more context to the error logs for easier debugging.
// Attach Post Data: Pass the fetched post data along with the request, so it can be reused in the next middleware or route handler, reducing redundant queries.
// More Informative Messages: Provide detailed error messages, e.g., specifying why the authorization failed.