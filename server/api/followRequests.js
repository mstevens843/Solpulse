const express = require('express');
const router = express.Router();
const { FollowRequest, Follower, Notification, User } = require('../models/Index');
const authMiddleware = require('../middleware/auth');



// 🔍 GET /api/follow-requests/:targetId/has-requested
// This checks if the current user has already sent a follow request to another user.
// Only checks one specific relationship: current user ➡️ target user.
router.get('/:targetId/has-requested', authMiddleware, async (req, res) => {
  const { targetId } = req.params;
  const requesterId = req.user.id;

  if (!requesterId || !targetId) {
    return res.status(400).json({ message: 'Missing user ID(s).' });
  }

  try {
    const request = await FollowRequest.findOne({
      where: {
        requesterId,
        targetId,
      },
    });

    res.json({ hasRequested: !!request });
  } catch (err) {
    console.error("Error checking follow request:", err);
    res.status(500).json({ message: 'Failed to check follow request.' });
  }
});


// 📥 GET /api/follow-requests/incoming — Get all pending requests for the current user
// This fetches all incoming follow requests sent to the current user.
// Used in your Notifications page or Follow Requests tab.
router.get('/incoming', authMiddleware, async (req, res) => {
  const currentUserId = req.user.id;

  try {
    const requests = await FollowRequest.findAll({
      where: { targetId: currentUserId },
      include: [
        {
          model: User,
          as: 'requesterUser', // You must have this alias set in the model
          attributes: ['id', 'username', 'profilePicture'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ requests });
  } catch (err) {
    console.error("Error fetching incoming follow requests:", err);
    res.status(500).json({ message: 'Failed to fetch follow requests.' });
  }
});




// 📩 POST /api/follow-requests/:targetId — Send request
router.post('/:targetId', authMiddleware, async (req, res) => {
  const { targetId } = req.params;
  const requesterId = req.user.id;

  if (parseInt(targetId) === requesterId) {
    return res.status(400).json({ message: 'You cannot request to follow yourself.' });
  }

  try {
    // Check if already following
    const isFollowing = await Follower.findOne({
      where: { followerId: requesterId, followingId: targetId },
    });
    if (isFollowing) {
      return res.status(409).json({ message: 'You already follow this user.' });
    }

    // Check if request already exists
    const existingRequest = await FollowRequest.findOne({
      where: { requesterId, targetId },
    });
    if (existingRequest) {
      return res.status(409).json({ message: 'Follow request already sent.' });
    }

    const newRequest = await FollowRequest.create({ requesterId, targetId });

    // 🔔 Optional: Create a notification for the private user
    await Notification.create({
      type: 'follow-request',
      userId: targetId,
      actorId: requesterId,
      content: 'requested to follow you.',
    });

    res.status(201).json({ message: 'Follow request sent.', request: newRequest });
  } catch (err) {
    console.error('Error creating follow request:', err);
    res.status(500).json({ message: 'Failed to send follow request.' });
  }
});









// ✅ PUT /api/follow-requests/:id/accept — Accept request
router.put('/:id/accept', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user.id;

  try {
    const request = await FollowRequest.findByPk(id);

    if (!request) return res.status(404).json({ message: 'Request not found.' });
    if (request.targetId !== currentUserId) {
      return res.status(403).json({ message: 'You are not authorized to accept this request.' });
    }

    // Create follower entry
    await Follower.create({
      followerId: request.requesterId,
      followingId: currentUserId,
    });

    // Optionally notify user they were accepted
    await Notification.create({
      type: 'follow-accepted',
      userId: request.requesterId,
      actorId: currentUserId,
      content: 'accepted your follow request.',
    });

    // Delete the request
    await request.destroy();

    res.json({ message: 'Follow request accepted.' });
  } catch (err) {
    console.error('Error accepting follow request:', err);
    res.status(500).json({ message: 'Failed to accept follow request.' });
  }
});





// ❌ DELETE /api/follow-requests/:targetId/cancel
router.delete('/:targetId/cancel', authMiddleware, async (req, res) => {
  const { targetId } = req.params;
  const requesterId = req.user.id;

  try {
    const request = await FollowRequest.findOne({
      where: { requesterId, targetId },
    });

    if (!request) return res.status(404).json({ message: 'No follow request to cancel.' });

    await request.destroy();
    res.json({ message: 'Follow request canceled.' });
  } catch (err) {
    console.error('Error canceling follow request:', err);
    res.status(500).json({ message: 'Failed to cancel follow request.' });
  }
});





// ❌ DELETE /api/follow-requests/:id/deny — Deny request
router.delete('/:id/deny', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user.id;

  try {
    const request = await FollowRequest.findByPk(id);

    if (!request) return res.status(404).json({ message: 'Request not found.' });
    if (request.targetId !== currentUserId) {
      return res.status(403).json({ message: 'You are not authorized to deny this request.' });
    }

    await request.destroy();
    res.json({ message: 'Follow request denied.' });
  } catch (err) {
    console.error('Error denying follow request:', err);
    res.status(500).json({ message: 'Failed to deny follow request.' });
  }
});

module.exports = router;
