/**
 * Comment Ownership Middleware for SolPulse
 * 
 * - Ensures that only thw owner of a comment can modify or delete it. 
 * - Precents unauthorized users from performing restricted actions.
 * - Attaches the comment to `req.comment` if the user is authorized.  
 */


const { Comment } = require('../models/Index');


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


/**
 * 🔍 Potential Issues & Optimizations - SKIPPED ALL 
1️⃣ No Validation for id Parameter
Issue: If req.params.id is missing or invalid (e.g., non-numeric), findByPk(id) could throw an error.
✅ Fix: Validate id before querying the database:

if (!id || isNaN(id)) {
  return res.status(400).json({ error: "Invalid comment ID" });
}


2️⃣ No Handling for Admin Users or Special Roles
Issue: If admin users should have override permissions, this middleware currently blocks them.
✅ Fix: Allow admin access:
if (req.user.role === "admin") {
  return next(); // Skip ownership check for admins
}


3️⃣ Performance Optimization – Use attributes to Limit Query Fields
Issue: findByPk(id) retrieves all fields from the database, even if only userId is needed.
✅ Fix: Optimize query by selecting only required fields:
const comment = await Comment.findByPk(id, { attributes: ["id", "userId"] });


4️⃣ Error Handling Improvement
Issue: If an unexpected error occurs, console.error(err) does not provide enough debugging information.
✅ Fix: Log more details including request info:
console.error(`Error in checkCommentOwnership: User ${req.user.id} | Comment ${id}`, err);
 */