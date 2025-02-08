const request = require('supertest');
const app = require('../../app'); // Your Express app
const db = require('../../models'); // Sequelize models
const { sequelize, Notification, User } = db;
const jwt = require('jsonwebtoken');

describe('Notifications API', () => {
  let user, actor, token;

  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Sync the database

    // Create a test user and actor
    user = await User.create({
      username: 'testuserski',
      email: 'testuserski@example.com',
      password: 'password123',
      walletAddress: 'g1QPBuPoXBocwL1cWWivsomo4LfvsnVn7Gc8STW6L8o',
    });

    actor = await User.create({
      username: 'actoruser',
      email: 'actor@example.com',
      password: 'password123',
      walletAddress: '76tJQNQuXJ3LnRXMiNKHRB9AVeDZaiq1ciBudLBd1tgj',
    });

    // Generate an authentication token
    token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Seed some notifications
    await Notification.bulkCreate([
      {
        userId: user.id,
        actorId: actor.id,
        type: 'like',
        message: 'Your post was liked.',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: user.id,
        actorId: actor.id,
        type: 'comment',
        message: 'Your post received a comment.',
        isRead: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: user.id,
        actorId: actor.id,
        type: 'follow',
        message: 'You have a new follower.',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  });

  afterAll(async () => {
    await sequelize.close(); // Close the database connection
  });

  describe('GET /api/notifications', () => {
    it('should fetch paginated notifications for the user', async () => {
      const res = await request(app)
        .get('/api/notifications?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.notifications).toHaveLength(2);
      expect(res.body.totalNotifications).toBe(3);
      expect(res.body.unreadCount).toBe(2);
      expect(res.body.currentPage).toBe(1);
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/notifications');
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    it('should mark a notification as read', async () => {
      const notification = await Notification.findOne({
        where: { userId: user.id, isRead: false },
      });

      const res = await request(app)
        .put(`/api/notifications/${notification.id}/read`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.notification.isRead).toBe(true);

      const updatedNotification = await Notification.findByPk(notification.id);
      expect(updatedNotification.isRead).toBe(true);
    });

    it('should return 404 for a non-existent notification', async () => {
      const res = await request(app)
        .put('/api/notifications/9999/read')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Notification not found');
    });

    it('should return 403 if the user does not own the notification', async () => {
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'otheruser@example.com',
        password: 'password123',
        walletAddress: 'E2XJjdoN7Lcz3X5kVt2wFpUMRmsVvRW4nLyNDPkTzGp',
      });

      const otherNotification = await Notification.create({
        userId: otherUser.id,
        actorId: actor.id,
        type: 'follow',
        message: 'Other user notification',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .put(`/api/notifications/${otherNotification.id}/read`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('You do not have permission to mark this notification as read');
    });
  });

  describe('POST /api/notifications/mark-all-read', () => {
    it('should mark all notifications as read for the user', async () => {
      const res = await request(app)
        .post('/api/notifications/mark-all-read')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('All notifications marked as read');

      const unreadNotifications = await Notification.count({
        where: { userId: user.id, isRead: false },
      });
      expect(unreadNotifications).toBe(0);
    });
  });
});