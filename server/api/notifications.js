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
 * NOTE: We *do* include the actor's name in `message` now.
 *       We also skip "Comment not found" if there's no matching DB row.
 */
const formatNotifications = async (notifications) => {
  return Promise.all(
    notifications.map(async (notification) => {
      // Actor might already be loaded (via include), else fallback to manual find
      const actor =
        notification.actor ||
        (await User.findByPk(notification.actorId, {
          attributes: ['username', 'profilePicture'],
        }));

      const username = actor?.username || 'Unknown';
      let content = null;
      let message = '';

      switch (notification.type) {
        case 'like':
          message = `${username} liked your post`;
          break;

        case 'comment': {
          const comment = await Comment.findByPk(notification.entityId);
          if (comment) content = comment.content; // If comment exists, store it
          message = `${username} commented on your post`;
          break;
        }

        case 'follow':
          message = `${username} started following you`;
          break;

        case 'message': {
          const msg = await Message.findByPk(notification.entityId);
          if (msg) content = msg.content; // If message exists
          message = `${username} sent you a message`;
          break;
        }

        case 'transaction':
          message = `${username} sent you ${notification.amount} SOL`;
          break;

        case 'retweet':
          message = `${username} reposted your post`;
          break;

        default:
          message = `You have a new notification from ${username}`;
      }

      return {
        id: notification.id,
        actor: username,
        profilePicture: actor?.profilePicture || null,
        type: notification.type,
        message,
        content, // null or the actual content
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
 */
router.get('/full', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          as: 'actor',
          attributes: ['username', 'profilePicture'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Format them so the `message` includes the actor's name again
    const detailedNotifications = await formatNotifications(notifications);

    res.json({ notifications: detailedNotifications });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});


/**
 * GET /api/notifications
 * Paginated, optionally filtered by `type`.
 */
router.get('/', authMiddleware, async (req, res) => {
  const { page = 1, limit = 10, type } = req.query;
  const offset = (page - 1) * limit;

  const whereCondition = { userId: req.user.id };
  if (type) {
    whereCondition.type = type; // Filter by type if given
  }

  try {
    const { count, rows } = await Notification.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'actor',
          attributes: ['id', 'username', 'profilePicture'],
        },
      ],
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
 */
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    if (notification.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    notification.isRead = true;
    await notification.save();

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
 * Creates a new Notification record.
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
      amount: type === 'transaction' ? amount : null,
      entityId: entityId || null,
    });

    res.status(201).json(newNotification);
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});


/**
 * GET /api/notifications/tips
 */
router.get('/tips', authMiddleware, async (req, res) => {
  try {
    const tipNotifications = await Notification.findAll({
      where: { userId: req.user.id, type: 'transaction' },
      order: [['createdAt', 'DESC']],
    });

    if (!tipNotifications.length) {
      return res.json({ tips: [] });
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