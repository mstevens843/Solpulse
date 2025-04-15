/**
 * Notifications Routes for SolPulse API
 *
 * - Handles fetching, creating, and marking notifications as read.
 * - Supports different notification types (likes, comments, follows, tips, messages).
 * - Includes pagination, filtering, and real-time updates.
 */



const express = require('express');
const { Notification, User, Comment, Message } = require('../models');
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
      const actor = notification.actor;


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
        profilePicture: actor.profilePicture || null, 
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
          attributes: ['username', 'profilePicture'],
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

          case 'transaction':
            content = notification.content || null; //  show tip message
            message = `${actor.username} sent you ${notification.amount} SOL`;
            break;

          case 'retweet':
            message = `${actor.username} reposted your post`;
            break;

          case 'like':
            message = `${actor.username} liked your post`;
            break;

          case 'follow':
            message = `${actor.username} started following you`;
            break;

          default:
            message = `${actor.username} ${notification.type}`;
        }

        return {
          id: notification.id,
          user: notification.userId,
          actor: actor.username,
          profilePicture: actor.profilePicture || null,
          type: notification.type,
          message,
          content, //  included for tips/comments/messages
          amount: notification.amount || null,
          entityId: notification.entityId || null,
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

  const whereCondition = {
    userId: req.user.id,
    isRead: false, //  Only fetch unread notifications
  };

  if (type) whereCondition.type = type;

  try {
    const { count, rows } = await Notification.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'actor',
          attributes: ['id', 'username', 'profilePicture'], //  match frontend needs
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const unreadCount = count;

    const formattedNotifications = await formatNotifications(rows);

    res.json({
      notifications: formattedNotifications,
      totalNotifications: count,
      unreadCount,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error('❌ Error fetching notifications:', err);
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
    const { type, actorId, userId, amount, entityId, content } = req.body;

    if (!type || !actorId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newNotification = await Notification.create({
      type,
      actorId,
      userId,
      amount: type === 'transaction' ? amount : null,
      entityId: entityId || null,
      content: content || null, //  Add this line
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
      where: {
        userId: req.user.id,
        type: 'transaction',
        isRead: false,
      },
      include: [
        {
          model: User,
          as: 'actor',
          attributes: ['username', 'profilePicture'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const formattedTips = tipNotifications.map((n) => ({
      id: n.id,
      user: n.userId,
      actor: n.actor.username,
      profilePicture: n.actor.profilePicture,
      type: n.type,
      message: `${n.actor.username} sent you ${n.amount} SOL`,
      content: n.content || null,
      amount: n.amount,
      entityId: n.entityId,
      isRead: n.isRead,
      createdAt: n.createdAt,
    }));

    res.json({ tips: formattedTips });
  } catch (err) {
    console.error('Error fetching tip notifications:', err);
    res.status(500).json({ error: 'Failed to fetch tip notifications' });
  }
});
module.exports = router;

