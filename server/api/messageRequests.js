const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { MessageRequest, Notification, User, Message } = require('../models'); 
// ^^^ Make sure you have a "Message" model or rename to match your actual model.

// 🔍 GET /api/message-requests/:recipientId/has-requested
router.get('/:recipientId/has-requested', authMiddleware, async (req, res) => {
  const senderId = req.user.id;
  const { recipientId } = req.params;

  try {
    const existing = await MessageRequest.findOne({
      where: { senderId, recipientId, status: 'pending' },
    });

    res.json({ hasRequested: !!existing });
  } catch (err) {
    console.error('Error checking message request:', err);
    res.status(500).json({ message: 'Failed to check request status.' });
  }
});

// 📥 GET /api/message-requests/incoming — Get all requests sent to you
router.get('/incoming', authMiddleware, async (req, res) => {
  try {
    const requests = await MessageRequest.findAll({
      where: { recipientId: req.user.id, status: 'pending'},
      include: [
        {
          model: User,
          as: 'senderUser',
          attributes: ['id', 'username', 'profilePicture'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ requests });
  } catch (err) {
    console.error('Error fetching incoming message requests:', err);
    res.status(500).json({ message: 'Failed to fetch incoming requests.' });
  }
});

// 📩 POST /api/message-requests/:recipientId — Send request
router.post('/:recipientId', authMiddleware, async (req, res) => {
  const senderId = req.user.id;
  const { recipientId } = req.params;
  const { message } = req.body;

  if (parseInt(senderId) === parseInt(recipientId)) {
    return res.status(400).json({ message: 'You cannot send a message request to yourself.' });
  }

  try {
    const existing = await MessageRequest.findOne({ where: { senderId, recipientId, status: 'pending' } });
    if (existing) {
      return res.status(409).json({ message: 'Message request already sent.' });
    }

    // Create the pending message request
    const newRequest = await MessageRequest.create({ senderId, recipientId, message });

    // Also create a notification for the recipient
    const notification = await Notification.create({
      type: 'message-request',
      userId: recipientId,
      actorId: senderId,
      content: 'sent you a message request.',
    });

    newRequest.notificationId = notification.id;
    await newRequest.save();

    res.status(201).json({ message: 'Message request sent.', request: newRequest });
  } catch (err) {
    console.error('Error sending message request:', err);
    res.status(500).json({ message: 'Failed to send request.' });
  }
});

// ✅ PUT /api/message-requests/:id/accept — Accept request
router.put('/:id/accept', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user.id;

  try {
    const request = await MessageRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }
    if (request.recipientId !== currentUserId) {
      return res.status(403).json({ message: 'Not authorized to accept this request.' });
    }

    // Mark as accepted
    request.status = 'accepted';
    await request.save();

    // Create an actual message in your main "Messages" table
    // so the conversation shows up in the private user's inbox
    const newMessage = await Message.create({
      senderId: request.senderId,
      recipientId: request.recipientId,
      content: request.message,  // the text from the request
    });

    // (Optional) create a new notification for the sender that it was accepted
    await Notification.create({
      type: 'message',
      userId: request.senderId,     // the original sender
      actorId: currentUserId,       // the private user (who accepted)
      content: 'accepted your message request.',
    });

    return res.json({
      message: 'Message request accepted.',
      newMessage,
    });
  } catch (err) {
    console.error('Error accepting message request:', err);
    res.status(500).json({ message: 'Failed to accept request.' });
  }
});

// ❌ DELETE /api/message-requests/:recipientId/cancel — Sender cancels request
router.delete('/:recipientId/cancel', authMiddleware, async (req, res) => {
  const { recipientId } = req.params;
  const senderId = req.user.id;

  try {
    const request = await MessageRequest.findOne({
      where: { senderId, recipientId },
    });

    if (!request) {
      return res.status(404).json({ message: 'No message request to cancel.' });
    }

    await request.destroy();
    res.json({ message: 'Message request canceled.' });
  } catch (err) {
    console.error('Error canceling message request:', err);
    res.status(500).json({ message: 'Failed to cancel request.' });
  }
});

// ❌ DELETE /api/message-requests/:id/deny — Deny request
router.delete('/:id/deny', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user.id;

  try {
    const request = await MessageRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }
    if (request.recipientId !== currentUserId) {
      return res.status(403).json({ message: 'Not authorized to deny this request.' });
    }

    await request.destroy();
    res.json({ message: 'Message request denied.' });
  } catch (err) {
    console.error('Error denying message request:', err);
    res.status(500).json({ message: 'Failed to deny request.' });
  }
});

module.exports = router;