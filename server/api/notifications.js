/**
 * Notifications Routes for SolPulse API
 *
 * - Handles fetching, creating, and marking notifications as read.
 * - Supports different notification types (likes, comments, follows, tips, messages).
 * - Includes pagination, filtering, and real-time updates.
 */



const express = require('express');
const { Notification, User, Comment, Message } = require('../models/Index');
const authMiddleware = require('../middleware/auth');
const router = express.Router();


/**
 * Utility function to format notifications with dynamic messages.
 *
 * - Fetches the actor (user who performed the action).
 * - Generates human-readable messages for each notification type.
 */
const formatNotifications = async (notifications) => {
  return Promise.all(
    notifications.map(async (notification) => {
      // Fetch actor (user who performed the action)
      const actor = await User.findByPk(notification.actorId, {
        attributes: ['username'],
      });

      // Generate appropriate notification message based on type
let message;
switch (notification.type) {
  case 'like':
    message = `${actor.username} liked your post`;
    break;
  case 'comment':
    message = `${actor.username} commented on your post`;
    break;
  case 'follow':
    message = `${actor.username} started following you`;
    break;
  case 'message':
    message = `${actor.username} sent you a message`;
    break;
  case 'transaction':
    message = `${actor.username} sent you ${notification.amount} SOL`;
    break;
  case 'retweet':  // Add retweet case
    message = `${actor.username} reposted your post`;
    break;
  default:
    message = `You have a new notification`;
}

      return {
        id: notification.id,
        user: notification.userId,
        actor: actor.username,
        type: notification.type,
        message: message,
        amount: notification.amount || null,
        entityId: notification.entityId || null,
        entityType: notification.entityType || null,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      };
    })
  );
};


/**
 * GET /api/notifications/full
 * Fetch full notifications with detailed content for comments/messages.
 */
router.get('/full', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    const detailedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        const actor = await User.findByPk(notification.actorId, {
          attributes: ['username'],
        });

        let content = null;
        let message;

        switch (notification.type) {
          case 'comment':
            const comment = await Comment.findByPk(notification.entityId);
            content = comment ? comment.content : "Comment not found";
            message = `${actor.username} commented on your post`;
            break;
          case 'message':
            const msg = await Message.findByPk(notification.entityId);
            content = msg ? msg.content : "Message not found";
            message = `${actor.username} sent you a message`;
            break;
          default:
            message = `${actor.username} ${notification.type}`;
        }

        return {
          id: notification.id,
          user: notification.userId,
          actor: actor.username,
          type: notification.type,
          message: message,
          content: content,  // Include full content for comments/messages
          isRead: notification.isRead,
          createdAt: notification.createdAt,
        };
      })
    );

    res.json({ notifications: detailedNotifications });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * GET /api/notifications
 * Fetch all notifications for the authenticated user with pagination
 */
router.get('/', authMiddleware, async (req, res) => {
  const { page = 1, limit = 10, type } = req.query;
  const offset = (page - 1) * limit;

  const whereCondition = { userId: req.user.id };
  if (type) whereCondition.type = type; // Filter by type if provided

  try {
    const { count, rows } = await Notification.findAndCountAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const unreadCount = await Notification.count({
      where: { userId: req.user.id, isRead: false },
    });

    const formattedNotifications = await formatNotifications(rows);

    res.json({
      notifications: formattedNotifications,
      totalNotifications: count,
      unreadCount,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});


/**
 * PUT /api/notifications/mark-all-read
 * Mark all notifications as read.
 */
router.put('/mark-all-read', authMiddleware, async (req, res) => {
  try {
    const [updatedCount] = await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );

    if (updatedCount === 0) {
      return res.status(404).json({ error: 'No unread notifications found' });
    }

    // Get the updated unread count after marking all as read
    const unreadCount = await Notification.count({
      where: { userId: req.user.id, isRead: false },
    });

    res.json({
      message: 'All notifications marked as read',
      unreadCount,
    });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});


/**
 * PUT /api/notifications/:id/read
 * Mark a notification as read
 */
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to modify this notification' });
    }

    notification.isRead = true;
    await notification.save();

    // Get updated unread count
    const unreadCount = await Notification.count({
      where: { userId: req.user.id, isRead: false },
    });

    res.json({ message: 'Notification marked as read', unreadCount });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});


/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read for the authenticated user
 */
router.post('/mark-all-read', authMiddleware, async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});


/**
 * POST /api/notifications
 * 
 * Creates a new notification in the database when an event occurs 
 * (e.g., like, comment, follow, message, transaction).
 * 
 * This route is triggered when a user performs an action that requires 
 * notifying another user, such as:
 * - Liking a post
 * - Reposting a post
 * - Commenting on a post
 * - Following another user
 * - Sending a direct message
 * - Sending a crypto tip (transaction)
 * 
 * @param {string} type - The type of notification (e.g., "like", "comment", "follow", "message", "transaction").
 * @param {number} actorId - The ID of the user who performed the action.
 * @param {number} userId - The ID of the user receiving the notification.
 * @param {number} [amount] - The transaction amount (only for "transaction" type notifications).
 * @param {string} [entityId] - The associated entity ID (e.g., post ID, comment ID, or transaction signature).
 * 
 * @returns {Object} The newly created notification object.
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, actorId, userId, amount, entityId } = req.body;

    if (!type || !actorId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newNotification = await Notification.create({
      type,
      actorId,
      userId,
      amount: type === 'transaction' ? amount : null, // Only store amount for tips
      entityId: entityId || null, // Store transaction signature for tips
    });

    res.status(201).json(newNotification);
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

/**
 * GET /api/notifications/tips
 * Fetch only tip notifications
 */
router.get('/tips', authMiddleware, async (req, res) => {
  try {
    const tipNotifications = await Notification.findAll({
      where: { userId: req.user.id, type: 'transaction' },
      order: [['createdAt', 'DESC']],
    });

    if (!tipNotifications.length) {
      return res.json({ tips: [] }); // Return empty array if no tips found
    }

    const formattedTips = await formatNotifications(tipNotifications);
    res.json({ tips: formattedTips });
  } catch (err) {
    console.error('Error fetching tip notifications:', err);
    res.status(500).json({ error: 'Failed to fetch tip notifications' });
  }
});

module.exports = router;



/**
 * 🔍 Potential Issues & Optimizations
1️⃣ Inefficient Database Queries for Notifications - SKIPPED

Issue: Each notification fetch requires an additional query to get the actor’s username.
✅ Fix: Use Sequelize associations to fetch actor data in a single query:

const notifications = await Notification.findAll({
    where: { userId: req.user.id },
    include: [{ model: User, as: 'actor', attributes: ['username'] }],
    order: [['createdAt', 'DESC']],
});
2️⃣ No Real-Time WebSocket Updates for New Notifications - SKIPPED

Issue: Users must refresh to see new notifications.
✅ Fix: Emit WebSocket events for new notifications:

io.emit('new-notification', formattedNotification);
3️⃣ No Expiry or Auto-Archiving of Old Notifications - SKIPPED 

Issue: Notifications keep accumulating, impacting performance.
✅ Fix: Implement an auto-delete or archive mechanism for older notifications.
 */