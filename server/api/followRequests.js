const express = require('express');
const router = express.Router();
const { FollowRequest, Follower, Notification, User } = require('../models');
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
      where: { requesterId, targetId },
    });

    // ✅ Always return safely even if request is null
    return res.status(200).json({ hasRequested: !!request });
  } catch (err) {
    console.error('❌ Error in has-requested:', err.stack || err);
    return res.status(200).json({ hasRequested: false }); // ✅ fallback to false if anything breaks
  }
});


// 📥 GET /api/follow-requests/incoming — Get all pending requests for the current user
// This fetches all incoming follow requests sent to the current user.
// Used in your Notifications page or Follow Requests tab.
// 📥 GET /api/follow-requests/incoming — Get all incoming follow requests
router.get('/incoming', authMiddleware, async (req, res) => {
  const currentUserId = req.user.id;

  try {
    const requests = await FollowRequest.findAll({
      where: { targetId: currentUserId },
      include: [
        {
          model: User,
          as: 'requester', // ✅ Must match your model alias
          attributes: ['id', 'username', 'profilePicture'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // ✅ Format requests as notification-like payloads
    res.json({
      requests: requests.map((r) => ({
        id: r.id, // follow request ID
        notificationId: r.notificationId || null,
        actor: r.requester?.username || 'Unknown',
        profilePicture: r.requester?.profilePicture || null,
        message: 'requested to follow you',
        createdAt: r.createdAt,
        isRead: false,
        type: 'follow-request',
      })),
    });
  } catch (err) {
    console.error("❌ Error fetching incoming follow requests:", err);
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
    // ✅ Check if already following
    const isFollowing = await Follower.findOne({
      where: { followerId: requesterId, followingId: targetId },
    });
    if (isFollowing) {
      return res.status(409).json({ message: 'You already follow this user.' });
    }

    // ✅ Check if request already exists
    const existingRequest = await FollowRequest.findOne({
      where: { requesterId, targetId },
    });
    if (existingRequest) {
      return res.status(409).json({ message: 'Follow request already sent.' });
    }

    // ✅ Create a follow-request notification
    const notification = await Notification.create({
      type: 'follow-request',
      userId: targetId,             // Receiver
      actorId: requesterId,         // Sender
      message: 'requested to follow you',
      isRead: false,
    });

    // ✅ Create the follow request with notificationId attached
    const newRequest = await FollowRequest.create({
      requesterId,
      targetId,
      notificationId: notification.id,
    });

    res.status(201).json({
      message: 'Follow request sent.',
      request: {
        id: newRequest.id,
        requesterId: newRequest.requesterId,
        targetId: newRequest.targetId,
        notificationId: newRequest.notificationId,
        createdAt: newRequest.createdAt,
      },
    });
  } catch (err) {
    console.error('❌ Error creating follow request:', err);
    res.status(500).json({ message: 'Failed to send follow request.' });
  }
});









// ✅ PUT /api/follow-requests/:id/accept — Accept request
router.put('/:id/accept', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user.id;

  try {
    const request = await FollowRequest.findByPk(id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    if (request.targetId !== currentUserId) {
      return res.status(403).json({ message: 'You are not authorized to accept this request.' });
    }

    // ✅ Create follow notification for the requester
    const followNotification = await Notification.create({
      type: 'follow',
      userId: currentUserId,        // Receiver
      actorId: request.requesterId, // Who followed
      message: `User started following you`, // Clean default message
      isRead: false,
    });

    // ✅ Create actual follower record with notification
    await Follower.create({
      followerId: request.requesterId,
      followingId: currentUserId,
      notificationId: followNotification.id,
    });

    // ✅ Delete follow request
    await request.destroy();

    res.json({ message: 'Follow request accepted and follower added.' });
  } catch (err) {
    console.error('❌ Error accepting follow request:', err);
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
