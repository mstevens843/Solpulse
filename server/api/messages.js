const express = require('express');

const { Message, User, Notification } = require('../models/Index');
const authMiddleware = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const { Op } = require('sequelize'); // import sequelize operators
const router = express.Router();

/**
 * Utility function to format messages
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

// Create a new route to fetch messages ensuring sender username is included:
router.get('/detailed', authMiddleware, async (req, res) => {
  const { page = 1 } = req.query;  // Default page is 1
  const limit = 10;  // Fixed pagination limit
  const offset = (page - 1) * limit;

  try {
    console.log('Fetching messages with sender details for user:', req.user.id);
    
    const { count, rows } = await Message.findAndCountAll({
      where: { recipientId: req.user.id },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username'], 
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
        id: msg.id,
        sender: msg.sender?.username || `User ${msg.sender?.id || 'unknown'}`,
        content: msg.content,
        cryptoTip: msg.cryptoTip !== undefined ? msg.cryptoTip : 0.0,
        read: msg.read,
        readAt: msg.readAt || null,
        createdAt: msg.createdAt,
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
 * Search users based on query input for message recipient suggestions
 * Placed at the top to allow searching functionality before fetching messages
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
 */
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    console.log('Marking message as read. User:', req.user.id, 'Message ID:', req.params.id);
    const message = await Message.findByPk(req.params.id);
    if (!message || message.recipientId !== req.user.id) {
      return res.status(404).json({ error: 'Message not found or unauthorized.' });
    }

    message.read = true;
    message.readAt = new Date(); // Set the readAt timestamp
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

      console.log('Creating new message...');
      const newMessage = await Message.create({
        senderId: req.user.id,
        recipientId: recipientUser.id,
        content: message.trim(),
        cryptoTip: cryptoTip !== undefined && cryptoTip !== null ? parseFloat(cryptoTip) : 0.0, // Default to 0.0 if missing
        read: false,
      });

      console.log('Creating notification for recipient...');
      await Notification.create({
        userId: recipientUser.id,
        actorId: req.user.id,
        type: 'message',
        message: `You have a new message from ${req.user.username || 'Unknown User'}.`,
        isRead: false,
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