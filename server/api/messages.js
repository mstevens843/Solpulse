/**
 * Messaging Routes for SolPulse API
 *
 * - Manages user-to-user messaging.
 * - Supports message sending, retrieval, and search.
 * - Includes notifications and read receipts.
 */

const express = require('express');

const { Message, User, Notification } = require('../models/Index');
const authMiddleware = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const { Op } = require('sequelize'); // import sequelize operators
const multer = require('multer');
const path = require('path');
const router = express.Router();


// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/messages'); // or wherever you want to store
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

/**
 * Utility function to format messages for consistent API responses.
 */
const formatMessages = (messages) => {
  return messages.map((msg) => ({
    id: msg.id,
    sender: msg.sender.username,
    content: msg.content,
    cryptoTip: msg.cryptoTip !== undefined && msg.cryptoTip !== null ? msg.cryptoTip : 0.0,  // Default to 0.0
    read: msg.read,
    readAt: msg.readAt || null,
    createdAt: msg.createdAt,
  }));
};

/**
 * GET /api/messages/detailed
 * Fetch paginated messages for the logged-in user with sender details.
 */
router.get('/detailed', authMiddleware, async (req, res) => {
  const { page = 1 } = req.query;
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    const { count, rows } = await Message.findAndCountAll({
      where: { recipientId: req.user.id },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username'],
        },
        {
          model: Notification,
          as: 'notification',
          attributes: ['id', 'isRead'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    if (!rows.length) {
      return res.status(404).json({ error: 'No messages found.' });
    }

    res.json({
      messages: rows.map((msg) => ({
        id: msg.notificationId || msg.id,
        notificationId: msg.notificationId || null,
        sender: msg.sender?.username || `User ${msg.sender?.id || 'unknown'}`,
        content: msg.content,
        cryptoTip: msg.cryptoTip !== undefined ? msg.cryptoTip : 0.0,
        read: msg.read,
        readAt: msg.readAt || null,
        createdAt: msg.createdAt,
        isRead: msg.notification?.isRead || false,
      })),
      totalMessages: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error('Error fetching detailed messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});

/**
 * GET /api/messages/search-users
 * Search users based on query input for message recipient suggestions.
 */
router.get('/search-users', authMiddleware, async (req, res) => {
  const { query } = req.query;

  if (!query || query.trim() === "") {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const users = await User.findAll({
      where: {
        username: {
          [Op.iLike]: `%${query}%`, // Case-insensitive search
        }
      },
      attributes: ['username'],
      limit: 10, // Limit results for better performance
    });

    res.json({ users });
  } catch (err) {
    console.error("Error searching users:", err);
    res.status(500).json({ error: "Error searching users." });
  }
});

/**
 * GET /api/messages/recent
 * Fetch the 5 most recent messages for the logged-in user
 * Placed after search to allow suggestions first
 */
router.get('/recent', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching recent messages for user:', req.user.id);
    const recentMessages = await Message.findAll({
      where: { recipientId: req.user.id },
      include: [{ model: User, as: 'sender', attributes: ['username'] }],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    res.json({ messages: formatMessages(recentMessages) });
  } catch (err) {
    console.error('Error fetching recent messages:', err);
    res.status(500).json({ error: 'Failed to fetch recent messages.' });
  }
});

/**
 * GET /api/messages
 * Fetch paginated messages for the logged-in user
 */
router.get('/', authMiddleware, async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Pagination query parameters
  const offset = (page - 1) * limit;

  try {
    console.log('Fetching paginated messages for user:', req.user.id);
    const { count, rows } = await Message.findAndCountAll({
      where: { recipientId: req.user.id },
      include: [{ model: User, as: 'sender', attributes: ['username'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      messages: formatMessages(rows),
      totalMessages: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});

/**
 * PATCH /api/messages/:id/read
 * Mark a message as read
 * changes -
 * ✅ Key Changes
 * paranoid: false allows fetching soft-deleted messages.
 *  Added a deletedAt check to return a 410 Gone response for deleted messages.
 */
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    console.log('Marking message as read. User:', req.user.id, 'Message ID:', req.params.id);
    
    // Fetch message including soft-deleted ones
    const message = await Message.findByPk(req.params.id, { paranoid: false });

    // Check ownership and existence
    if (!message || message.recipientId !== req.user.id) {
      return res.status(404).json({ error: 'Message not found or unauthorized.' });
    }

    // Prevent marking deleted messages as read
    if (message.deletedAt) {
      return res.status(410).json({ error: 'Message has been deleted.' });
    }

    message.read = true;
    message.readAt = new Date();
    await message.save();

    res.json({ message: 'Message marked as read.', id: message.id });
  } catch (err) {
    console.error('Error marking message as read:', err);
    res.status(500).json({ error: 'Failed to mark message as read.' });
  }
});


/**
 * POST /api/messages
 * Send a new message
 */
router.post(
  '/',
  [
    authMiddleware,
    upload.single('attachment'),
    check('recipient', 'Recipient username is required').not().isEmpty(),
    check('message', 'Message content is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { recipient, message, cryptoTip } = req.body;

    try {
      console.log('Fetching recipient user...');
      const recipientUser = await User.findOne({ where: { username: recipient } });
      if (!recipientUser) {
        return res.status(404).json({ error: 'Recipient not found.' });
      }

      console.log('Creating notification for recipient...');
      const notification = await Notification.create({
        userId: recipientUser.id,
        actorId: req.user.id,
        type: 'message',
        message: `You have a new message from ${req.user.username || 'Unknown User'}.`,
        isRead: false,
      });

      console.log('Creating new message...');
      const newMessage = await Message.create({
        senderId: req.user.id,
        recipientId: recipientUser.id,
        content: message.trim(),
        cryptoTip: cryptoTip !== undefined && cryptoTip !== null ? parseFloat(cryptoTip) : 0.0,
        read: false,
        notificationId: notification.id, // ✅ Attach notification ID
        attachmentPath: req.file ? `/uploads/messages/${req.file.filename}` : null,
      });

      res.status(201).json({
        id: newMessage.id,
        sender: req.user.username,
        content: newMessage.content,
        cryptoTip: newMessage.cryptoTip,
        read: newMessage.read,
        createdAt: newMessage.createdAt,
      });
    } catch (err) {
      console.error('Error sending message:', err);
      res.status(500).json({ error: 'Failed to send message.' });
    }
  }
);
module.exports = router;

/**
 * 🔍 Potential Issues & Optimizations
1️⃣ No WebSocket Notification for New Messages - skipped

Issue: Messages are stored but don’t trigger real-time updates. - skipped. 
✅ Fix: Integrate WebSocket event broadcasting:
io.emit('new-message', { sender: req.user.username, content: message });
2️⃣ No Message Encryption for Privacy

Issue: Messages are stored in plaintext. - skipped. 
✅ Fix: Implement AES encryption using crypto-js or similar.
3️⃣ No Soft Deletion for Messages

Issue: Messages are permanently deleted when marked as read. 
 */



// Update the POST /api/messages route to use Multer middleware and extract fields from req.body and the uploaded file from req.file.
// ✅ Updated POST /api/messages Route (with Multer support)