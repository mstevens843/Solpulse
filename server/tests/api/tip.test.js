const request = require('supertest');
const app = require('../../app'); // Import your Express app
const db = require('../../models'); // Import your Sequelize models
const { sequelize, Tip, User } = db;
const jwt = require('jsonwebtoken');

describe('Tips API', () => {
  let sender, recipient, tokenSender, tokenRecipient;

  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Reset the database

    // Create test users with wallet addresses
    sender = await User.create({
      username: 'SolWizard',
      email: 'solwizard@solana.io',
      password: 'magic123',
      walletAddress: '3adeWDDDV7zNbuZ8nNrZ7DT6m1dsKYMiyukvJqf6Jiwr',
    });

    recipient = await User.create({
      username: 'CryptoScholar',
      email: 'cryptoscholar@solana.io',
      password: 'blockchain101',
      walletAddress: 'ApfJr2X7xy8HT9nobwRgNzv7eYwWToAFcc4njWUAptjv',
    });

    // Generate tokens for test users
    tokenSender = jwt.sign({ id: sender.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    tokenRecipient = jwt.sign({ id: recipient.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await sequelize.close(); // Close the database connection
  });

  describe('POST /api/tips', () => {
    it('should send a tip successfully', async () => {
      const res = await request(app)
        .post('/api/tips')
        .set('Authorization', `Bearer ${tokenSender}`)
        .send({
          toUserId: recipient.id,
          amount: 10.5,
          message: 'Here’s a tip for your stellar insights!',
        });

      expect(res.status).toBe(201);
      expect(res.body.tip).toBeDefined();
      expect(res.body.tip.fromUserId).toBe(sender.id);
      expect(res.body.tip.toUserId).toBe(recipient.id);
      expect(res.body.tip.amount).toBe(10.5);
      expect(res.body.message).toBe('Tip sent successfully!');
    });

    it('should fail if recipient ID is missing', async () => {
      const res = await request(app)
        .post('/api/tips')
        .set('Authorization', `Bearer ${tokenSender}`)
        .send({
          amount: 5,
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ msg: 'Recipient ID is required' }),
        ])
      );
    });

    it('should fail if amount is less than or equal to 0', async () => {
      const res = await request(app)
        .post('/api/tips')
        .set('Authorization', `Bearer ${tokenSender}`)
        .send({
          toUserId: recipient.id,
          amount: 0,
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ msg: 'Amount must be greater than 0' }),
        ])
      );
    });
  });

  describe('GET /api/tips/received', () => {
    it('should fetch received tips for a user', async () => {
      const res = await request(app)
        .get('/api/tips/received')
        .set('Authorization', `Bearer ${tokenRecipient}`);

      expect(res.status).toBe(200);
      expect(res.body.tips).toHaveLength(1); // Assuming only one tip has been sent
      expect(res.body.tips[0].toUserId).toBe(recipient.id);
    });

    it('should paginate received tips', async () => {
      for (let i = 0; i < 5; i++) {
        await Tip.create({
          fromUserId: sender.id,
          toUserId: recipient.id,
          amount: i + 1,
        });
      }

      const res = await request(app)
        .get('/api/tips/received?page=1&limit=3')
        .set('Authorization', `Bearer ${tokenRecipient}`);

      expect(res.status).toBe(200);
      expect(res.body.tips).toHaveLength(3); // Limit is 3 per page
      expect(res.body.currentPage).toBe(1);
      expect(res.body.totalPages).toBeGreaterThan(1);
    });
  });

  describe('GET /api/tips/sent', () => {
    it('should fetch sent tips for a user', async () => {
      const res = await request(app)
        .get('/api/tips/sent')
        .set('Authorization', `Bearer ${tokenSender}`);

      expect(res.status).toBe(200);
      expect(res.body.tips).toBeDefined();
      expect(res.body.tips[0].fromUserId).toBe(sender.id);
    });

    it('should paginate sent tips', async () => {
      const res = await request(app)
        .get('/api/tips/sent?page=2&limit=2')
        .set('Authorization', `Bearer ${tokenSender}`);

      expect(res.status).toBe(200);
      expect(res.body.tips).toHaveLength(2); // Limit is 2 per page
      expect(res.body.currentPage).toBe(2);
    });
  });

  describe('Authorization', () => {
    it('should return 401 if the user is not authenticated', async () => {
      const res = await request(app).get('/api/tips/sent');
      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });
  });
});


// Key Features:
// Setup and Cleanup:

// Syncs the database before all tests and closes it afterward.
// Endpoint Tests:

// Tests for sending, receiving, and fetching tips with pagination.
// Validation Tests:

// Ensures the request body validation rules are enforced.
// Authorization Tests:

// Verifies that only authenticated users can access the endpoints.
// Pagination:

// Tests both received and sent tips pagination behavior.
