const request = require('supertest');
const app = require('../../app'); // Your Express app
const db = require('../../models'); // Sequelize models
const { sequelize, Message, User } = db;
const jwt = require('jsonwebtoken');

describe('Messages API Routes', () => {
  let sender, recipient, token;

  beforeAll(async () => {
    // Fetch existing users
    sender = await User.findByPk(1); // Sender with ID 1
    recipient = await User.findByPk(2); // Recipient with ID 2

    // Generate token for the sender
    token = jwt.sign({ id: sender.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Log fetched users for debugging
    console.log('Fetched sender:', sender);
    console.log('Fetched recipient:', recipient);
  });

  afterAll(async () => {
    await sequelize.close(); // Close the database connection
  });

  describe('GET /api/messages/recent', () => {
    it('should fetch the 5 most recent messages', async () => {
      const res = await request(app)
        .get('/api/messages/recent')
        .set('Authorization', `Bearer ${token}`);
  
      console.log('Recent messages response:', res.body); // Debugging
  
      expect(res.status).toBe(200);
      expect(res.body.messages).toHaveLength(5); // Ensures 5 messages are returned
      expect(res.body.messages[0].content).toBe('Message 3 for user 1'); // Adjust based on the most recent message content (ID 28)
    });
  });

  

  describe('GET /api/messages', () => {
    it('should fetch paginated messages', async () => {
      const res = await request(app)
        .get('/api/messages?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`);

      console.log('Paginated messages response:', res.body); // Debugging

      expect(res.status).toBe(200);
      expect(res.body.messages).toBeDefined();
      expect(res.body.currentPage).toBe(1);
      expect(res.body.totalPages).toBe(1); // Adjust if seed data supports more pages
    });
  });

  describe('PATCH /api/messages/:id/read', () => {
    it('should mark a message as read', async () => {
      const message = await Message.findByPk(12); // Use a valid ID from your database (ID 12 here)
      console.log('Fetched message for marking as read:', message); // Debugging
  
      const res = await request(app)
        .patch(`/api/messages/${message.id}/read`)
        .set('Authorization', `Bearer ${token}`);
  
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Message marked as read.');
  
      const updatedMessage = await Message.findByPk(message.id);
      expect(updatedMessage.read).toBe(true);
      expect(updatedMessage.readAt).not.toBeNull();
    });
  
    it('should return 404 for invalid message ID', async () => {
      const res = await request(app)
        .patch('/api/messages/9999/read')
        .set('Authorization', `Bearer ${token}`);
  
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Message not found or unauthorized.');
    });
  });
  


  describe('POST /api/messages', () => {
    it('should send a new message', async () => {
      const res = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token}`)
        .send({
          recipient: recipient.username,
          message: 'Hello, recipient!',
          cryptoTip: 0.5,
        });

      console.log('New message response:', res.body); // Debugging

      expect(res.status).toBe(201);
      expect(res.body.content).toBe('Hello, recipient!');
      expect(res.body.cryptoTip).toBe(0.5);
    });

    it('should return validation error for missing fields', async () => {
      const res = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token}`)
        .send({ recipient: recipient.username });

      console.log('Validation error response:', res.body); // Debugging

      expect(res.status).toBe(400);
      expect(res.body.errors[0].msg).toBe('Message content is required');
    });

    it('should return 404 if recipient does not exist', async () => {
      const res = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token}`)
        .send({
          recipient: 'nonexistent',
          message: 'This will fail.',
        });

      console.log('Recipient not found response:', res.body); // Debugging

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Recipient not found.');
    });
  });
});