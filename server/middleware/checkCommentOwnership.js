/**
 * Comment Ownership Middleware for SolPulse
 * 
 * - Ensures that only thw owner of a comment can modify or delete it. 
 * - Precents unauthorized users from performing restricted actions.
 * - Attaches the comment to `req.comment` if the user is authorized.  
 */


const { Comment } = require('../models');


/** 
 * - Finds the comment by its ID. 
 * - Checks if the requesting user is the owner of the comment. 
 * - Returns a 404 if comment not found. 
 * - Returns a 403 if the user is not authorized. 
 */

const checkCommentOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to perform this action' });
    }

    req.comment = comment;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = checkCommentOwnership;