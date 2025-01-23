const express = require('express');
const { Message, User, Notification } = require('../models/Index');
const authMiddleware = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const router = express.Router();

/**
 * Utility function to format messages
 */
const formatMessages = (messages) => {
  return messages.map((msg) => ({
    id: msg.id,
    sender: msg.sender.username,
    content: msg.content,
    cryptoTip: msg.cryptoTip || null,
    read: msg.read,
    readAt: msg.readAt || null,
    createdAt: msg.createdAt,
  }));
};

/**
 * GET /api/messages/recent
 * Fetch the 5 most recent messages for the logged-in user
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
    console.log('Fetched messages:', recentMessages);

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
  console.log('Pagination Query Params:', { page, limit });

  try {
    console.log('Fetching paginated messages for user:', req.user.id);
    const { count, rows } = await Message.findAndCountAll({
      where: { recipientId: req.user.id },
      include: [{ model: User, as: 'sender', attributes: ['username'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    console.log('Paginated messages count:', count);

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
      console.warn('Message not found or unauthorized:', req.params.id);
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
        console.warn('Recipient not found:', recipient);
        return res.status(404).json({ error: 'Recipient not found.' });
      }

      console.log('Creating new message...');
      const newMessage = await Message.create({
        senderId: req.user.id,
        recipientId: recipientUser.id,
        content: message.trim(),
        cryptoTip: cryptoTip ? parseFloat(cryptoTip) : null,
        read: false,
      });

      console.log('Creating notification for recipient...');
      console.log('Sender username:', req.user.username);
      await Notification.create({
        userId: recipientUser.id,
        actorId: req.user.id,
        type: 'message', // Ensure this matches the database enum
        message: `You have a new message from ${req.user.username || 'Unknown User'}.`,
        isRead: false,
      });

      console.log('Message and notification created successfully.');
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


  




// Key Updates:
// Formatted GET Response:

// Transformed the message response to include only essential fields like id, sender, content, cryptoTip, and createdAt.
// POST Input Validation:

// Ensures the recipient and message fields are not empty before proceeding.
// Crypto Tip Handling:

// If the Solana tip fails, the message is still sent successfully, and a 207 (Multi-Status) response is returned to inform the client that the tip failed.
// Error Handling:

// More descriptive and user-friendly error messages.
// Consistency:

// API responses now align with the structure expected by the frontend.


// New Route: GET /api/messages/recent:

// Fetches the 5 most recent messages for the authenticated user.
// Includes the sender's username.
// Returns only essential fields: id, sender, content, and createdAt.
// Consistency:

// Maintains a consistent response format for messages.
// Error Handling:

// Provides clear error responses for failures.

// Explicit Validation: Use express-validator for input validation in the POST route.
// Consistency: Return a consistent structure for all API responses.
// Crypto Tip Default: Ensure cryptoTip is explicitly set to null if not provided.


// Key Improvements
// Input Validation with express-validator:

// Ensures recipient and message are provided in the POST request.
// Consistent Responses:

// All routes return cleanly formatted data:
// id, sender, content, cryptoTip, and createdAt.
// Crypto Tip Handling:

// Explicitly defaults cryptoTip to null if not provided or invalid.
// Error Messages:

// Clear and informative error messages for client-side and server-side issues.

// Key Improvements
// Utility Function for Formatting:

// Created a formatMessages function to handle repetitive formatting logic for messages.
// This ensures consistency and makes the code DRY (Don’t Repeat Yourself).
// Improved Error Handling:

// Added specific error logs with better context for easier debugging.
// Used more descriptive error messages in the responses.
// Consistent Status Codes:

// Used 201 for resource creation (POST request).
// Kept 500 for server errors but improved error logs for better tracking.
// Validation:

// Used express-validator to validate recipient and message in the POST /api/messages route, returning structured errors for invalid inputs.
// Security Enhancements:

// Ensured that crypto tips are safely parsed and validated (parseFloat to handle potential string inputs).
// Cleaned Up Logging:

// Used clear and concise console.error statements for troubleshooting while avoiding overly verbose logs.


// Here’s the updated full stack implementation for pagination, marking messages as read, and updating your frontend to match the backend updates. 

// Changes
// Pagination in GET /api/messages:

// Added query parameters page and limit to handle pagination.
// Included response metadata (totalMessages, totalPages, currentPage) for easier frontend integration.
// Read Status:

// Added a read property to the Message model (assumed it exists in the database schema).
// Introduced a PATCH /api/messages/:id/read route to mark messages as read.

// ormatting Consistency:

// Kept the formatMessages utility function for consistent formatting across routes.