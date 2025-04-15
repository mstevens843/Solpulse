/** Updated:
 * Blocks the blocked user from visiting
 * Allows the blocker to visit the user page
 * Adds req.isBlockedUser so the profile route can decide to hide posts & lists
 * **/

const { BlockedUser } = require('../models');
const { Op } = require('sequelize');

const checkBlockStatus = async (req, res, next) => {
  try {
    const currentUserId = req.user?.id;
    const paramId = req.params.userId || req.params.id;
    const targetUserId = parseInt(paramId, 10);

    if (!currentUserId || isNaN(targetUserId)) {
      console.warn("Block check skipped: Missing or invalid user IDs.", {
        currentUserId,
        targetUserId,
      });
      return next();
    }

    if (currentUserId === targetUserId) return next();

    const block = await BlockedUser.findOne({
      where: {
        [Op.or]: [
          { blockerId: currentUserId, blockedId: targetUserId },
          { blockerId: targetUserId, blockedId: currentUserId },
        ],
      },
    });

    if (block) {
      // Blocked user should not access
      if (block.blockerId === targetUserId) {
        return res.status(403).json({ message: "You are blocked by this user." });
      }

      // If requester is the blocker, allow but flag
      req.isBlockedUser = true;
    }

    return next();
  } catch (err) {
    console.error("Error checking block status:", err);
    return next(); // Fail open
  }
};

module.exports = checkBlockStatus;
