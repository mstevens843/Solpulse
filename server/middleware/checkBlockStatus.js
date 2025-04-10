// middleware/checkBlockStatus.js
const { BlockedUser } = require('../models/Index');
const { Op } = require('sequelize');

const checkBlockStatus = async (req, res, next) => {
  const currentUserId = req.user.id;
  const targetUserId = parseInt(req.params.userId); // assumes userId is in the route

  if (currentUserId === targetUserId) return next(); // allow self-actions

  try {
    const isBlocked = await BlockedUser.findOne({
      where: {
        [Op.or]: [
          { blockerId: currentUserId, blockedId: targetUserId }, // you blocked them
          { blockerId: targetUserId, blockedId: currentUserId }  // they blocked you
        ]
      }
    });

    if (isBlocked) {
      return res.status(403).json({ error: 'This action is not allowed due to a block.' });
    }

    next();
  } catch (err) {
    console.error('Block check error:', err);
    res.status(500).json({ error: 'Failed to verify block status' });
  }
};

module.exports = checkBlockStatus;
