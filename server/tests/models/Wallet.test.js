const db = require('../../models'); // Import all models using the correct path
const { Transaction, User } = db; // Extract Transaction and User models
const sequelize = db.sequelize; // Extract sequelize instance

describe('Transaction Model', () => {
  let user;

  beforeAll(async () => {
    // Sync the database and create a test user
    await sequelize.sync({ force: true }); // Force sync to start with a clean database
    user = await User.create({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
      walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Example valid Bitcoin address
    });
  });

  afterAll(async () => {
    // Close the Sequelize connection after tests
    await sequelize.close();
  });

  it('should create a transaction successfully', async () => {
    const transaction = await Transaction.create({
      userId: user.id,
      walletAddress: user.walletAddress,
      amount: 100.5,
      type: 'deposit',
      status: 'completed',
      referenceId: 'REF12345',
      description: 'Initial deposit',
    });

    expect(transaction).toBeDefined();
    expect(transaction.userId).toBe(user.id);
    expect(transaction.walletAddress).toBe(user.walletAddress);
    expect(transaction.amount).toBe(100.5);
    expect(transaction.type).toBe('deposit');
    expect(transaction.status).toBe('completed');
    expect(transaction.referenceId).toBe('REF12345');
    expect(transaction.description).toBe('Initial deposit');
  });

  it('should validate walletAddress format', async () => {
    await expect(
      Transaction.create({
        userId: user.id,
        walletAddress: 'invalid_wallet_address', // Invalid format
        amount: 50,
        type: 'deposit',
        status: 'pending',
      })
    ).rejects.toThrow('Invalid wallet address format.');
  });

  it('should validate that amount is greater than 0', async () => {
    await expect(
      Transaction.create({
        userId: user.id,
        walletAddress: user.walletAddress,
        amount: -10, // Invalid: negative amount
        type: 'withdrawal',
        status: 'failed',
      })
    ).rejects.toThrow('Amount must be at least 0.01.');
  });

  it('should enforce allowed values for type', async () => {
    await expect(
      Transaction.create({
        userId: user.id,
        walletAddress: user.walletAddress,
        amount: 20,
        type: 'invalid_type', // Invalid type
        status: 'pending',
      })
    ).rejects.toThrow('Invalid transaction type.');
  });

  it('should enforce allowed values for status', async () => {
    await expect(
      Transaction.create({
        userId: user.id,
        walletAddress: user.walletAddress,
        amount: 20,
        type: 'deposit',
        status: 'invalid_status', // Invalid status
      })
    ).rejects.toThrow('Invalid transaction status.');
  });

  it('should ensure unique referenceId', async () => {
    await Transaction.create({
      userId: user.id,
      walletAddress: user.walletAddress,
      amount: 50,
      type: 'deposit',
      status: 'completed',
      referenceId: 'REF12345',
    });

    await expect(
      Transaction.create({
        userId: user.id,
        walletAddress: user.walletAddress,
        amount: 50,
        type: 'deposit',
        status: 'completed',
        referenceId: 'REF12345',
      })
    ).rejects.toThrow('Reference ID must be unique.');
  });

  it('should cascade delete transactions when the associated user is deleted', async () => {
    const transaction = await Transaction.create({
      userId: user.id,
      walletAddress: user.walletAddress,
      amount: 30,
      type: 'transfer',
      status: 'pending',
    });

    expect(transaction).toBeDefined();

    await user.destroy(); // Delete the user

    // Check for soft delete (paranoid enabled)
    const deletedTransaction = await Transaction.findOne({
      where: { id: transaction.id },
      paranoid: false,
    });

    expect(deletedTransaction.deletedAt).not.toBeNull(); // Should be soft-deleted
  });
});