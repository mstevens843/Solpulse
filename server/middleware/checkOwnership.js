/**
 * Ownership Middleware for SolPulse
 * 
 * - Ensures users can only modify or delete their own posts or comments. 
 * - Dynamically detects whether the request is for a post or comment.
 * - Returns appropriate HTTP errors for unat
 */


const { Post, Comment } = require('../models/Index');


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

/**
 * 🔍 Potential Issues & Optimizations - SKIPPED ALL
1️⃣ Ownership Check Limited to URL Inspection
Issue: The middleware determines whether it’s checking a post or comment based on the URL (req.originalUrl), which could break if routes change or if another entity is added.
✅ Fix: Explicitly specify the entity in route parameters instead of relying on URL matching:
const { id, entityType } = req.params;
if (entityType === "comment") {
    // Handle comment verification
} else if (entityType === "post") {
    // Handle post verification
}
Update your route definitions to pass the entity type dynamically, like:
app.delete("/api/:entityType/:id", checkOwnership, deleteHandler);


2️⃣ No Check for Admin Privileges
Issue: Admins should likely be able to delete posts and comments regardless of ownership.
✅ Fix: Allow admins to bypass the ownership check:
if (req.user.role === "admin") {
    return next(); // Allow admin to proceed
}


3️⃣ Potential Performance Issue with findByPk(id) Retrieving All Fields
Issue: The queries retrieve all fields, but only userId is needed for ownership checks.
✅ Fix: Select only necessary fields to optimize performance:
const comment = await Comment.findByPk(id, { attributes: ["id", "userId"] });
const post = await Post.findByPk(id, { attributes: ["id", "userId"] });


4️⃣ Inconsistent Error Messagess
Issue: The error messages for unauthorized actions are inconsistent (Unauthorized to delete this post vs. Unauthorized to delete this comment).
✅ Fix: Use a unified error response format:
return res.status(403).json({ error: `Unauthorized to modify this ${req.originalUrl.includes('comments') ? 'comment' : 'post'}` });
 */