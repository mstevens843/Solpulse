const express = require('express');
const { Notification, User } = require('../models/Index');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

/**
 * Utility function to format notifications with dynamic messages
 * @param {Array} notifications - Array of notification objects
 * @returns {Array} - Formatted notifications
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

module.exports = router;
