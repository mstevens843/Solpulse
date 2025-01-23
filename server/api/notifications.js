const express = require('express');
const { Notification, User } = require('../models/Index'); // Assuming Notification and User models exist
const authMiddleware = require('../middleware/auth');
const router = express.Router();

/**
 * Utility function to format notifications
 * @param {Array} notifications - Array of notification objects
 * @returns {Array} - Formatted notifications
 */
const formatNotifications = (notifications) => {
  return notifications.map((notification) => ({
    id: notification.id,
    content: notification.content, // Assuming there's a `content` field
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  }));
};

/**
 * GET /api/notifications
 * Fetch all notifications for the authenticated user with pagination
 */
router.get('/', authMiddleware, async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Pagination query parameters
  const offset = (page - 1) * limit;

  try {
    const { count, rows } = await Notification.findAndCountAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Count unread notifications
    const unreadCount = await Notification.count({
      where: { userId: req.user.id, isRead: false },
    });

    res.json({
      notifications: formatNotifications(rows),
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
 * PUT /api/notifications/:id/read
 * Mark a notification as read
 */
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Ensure the logged-in user owns the notification
    if (notification.userId !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to mark this notification as read' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      message: 'Notification marked as read',
      notification: {
        id: notification.id,
        content: notification.content, // Assuming there's a `content` field
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      },
    });
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



// Key Improvements
// Pagination:

// Added support for pagination in the GET /api/notifications route using page and limit query parameters.
// Ensures scalability when the number of notifications grows.
// Response Formatting:

// Introduced the formatNotifications function to ensure consistent formatting of notification responses.
// Simplifies adding/removing fields to the response structure in the future.
// Enhanced Error Handling:

// Improved error messages for scenarios like missing notifications (404) and unauthorized access (403).
// Clearer logging for better debugging.
// Consistent Success Responses:

// The PUT /api/notifications/:id/read route now responds with a structured success message.

// Backend:

// Added POST /api/notifications/mark-all-read for marking all notifications as read.
// Unread count included in GET /api/notifications.