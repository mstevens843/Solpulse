const express = require('express');
const router = express.Router();
const { BlockedUser, MutedUser, User } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

// 🔒 BLOCK ROUTES

// Block a user
router.post('/block/:userId', authMiddleware, async (req, res) => {
  try {
    const blockerId = req.user.id;
    const blockedId = parseInt(req.params.userId);

    if (blockerId === blockedId) return res.status(400).json({ error: "You can't block yourself" });

    await BlockedUser.findOrCreate({
      where: { blockerId, blockedId }
    });

    res.status(200).json({ message: 'User blocked successfully' });
  } catch (err) {
    console.error('Block Error:', err);
    res.status(500).json({ error: 'Failed to block user' });
  }
});

// Unblock a user
router.delete('/block/:userId', authMiddleware, async (req, res) => {
  try {
    const blockerId = req.user.id;
    const blockedId = parseInt(req.params.userId);

    await BlockedUser.destroy({
      where: { blockerId, blockedId }
    });

    res.status(200).json({ message: 'User unblocked successfully' });
  } catch (err) {
    console.error('Unblock Error:', err);
    res.status(500).json({ error: 'Failed to unblock user' });
  }
});

// Get list of users you've blocked
router.get('/block', authMiddleware, async (req, res) => {
  try {
    const blockerId = req.user.id;

    const blocked = await BlockedUser.findAll({
      where: { blockerId },
      include: [{ model: User, as: 'blocked', attributes: ['id', 'username', 'profilePicture'] }]
    });

    res.status(200).json(blocked.map(b => b.blocked));
  } catch (err) {
    console.error('Get Blocked Error:', err);
    res.status(500).json({ error: 'Failed to fetch blocked users' });
  }
});

// (Optional) Get users who have blocked you
router.get('/block/by-others', authMiddleware, async (req, res) => {
  try {
    const blockedId = req.user.id;

    const blockedBy = await BlockedUser.findAll({
      where: { blockedId },
      include: [{ model: User, as: 'blocker', attributes: ['id', 'username', 'profilePicture'] }]
    });

    res.status(200).json(blockedBy.map(b => b.blocker));
  } catch (err) {
    console.error('Blocked By Others Error:', err);
    res.status(500).json({ error: 'Failed to fetch who blocked you' });
  }
});

// 🔕 MUTE ROUTES

// Mute a user
router.post('/mute/:userId', authMiddleware, async (req, res) => {
  try {
    const muterId = req.user.id;
    const mutedId = parseInt(req.params.userId);

    if (muterId === mutedId) return res.status(400).json({ error: "You can't mute yourself" });

    await MutedUser.findOrCreate({
      where: { muterId, mutedId }
    });

    res.status(200).json({ message: 'User muted successfully' });
  } catch (err) {
    console.error('Mute Error:', err);
    res.status(500).json({ error: 'Failed to mute user' });
  }
});

// Unmute a user
router.delete('/mute/:userId', authMiddleware, async (req, res) => {
  try {
    const muterId = req.user.id;
    const mutedId = parseInt(req.params.userId);

    await MutedUser.destroy({
      where: { muterId, mutedId }
    });

    res.status(200).json({ message: 'User unmuted successfully' });
  } catch (err) {
    console.error('Unmute Error:', err);
    res.status(500).json({ error: 'Failed to unmute user' });
  }
});

// Get list of users you've muted
router.get('/mute', authMiddleware, async (req, res) => {
  try {
    const muterId = req.user.id;

    const muted = await MutedUser.findAll({
      where: { muterId },
      include: [{ model: User, as: 'muted', attributes: ['id', 'username', 'profilePicture'] }]
    });

    res.status(200).json(muted.map(m => m.muted));
  } catch (err) {
    console.error('Get Muted Error:', err);
    res.status(500).json({ error: 'Failed to fetch muted users' });
  }
});

module.exports = router;
