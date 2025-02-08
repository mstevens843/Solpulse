const db = require('../../models');
const { Tip, User } = db;
const sequelize = db.sequelize;

describe('Tip Model', () => {
  let sender, recipient;

  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Sync database to start fresh
    sender = await User.create({
      username: 'senderUser',
      email: 'sender@example.com',
      password: 'password123',
      walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    });
    recipient = await User.create({
      username: 'recipientUser',
      email: 'recipient@example.com',
      password: 'password123',
      walletAddress: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
    });
  });

  afterAll(async () => {
    await sequelize.close(); // Close connection after tests
  });

  it('should create a tip successfully', async () => {
    const tip = await Tip.create({
      fromUserId: sender.id,
      toUserId: recipient.id,
      amount: 5.5,
      message: 'Great post!',
    });

    expect(tip.id).toBeDefined();
    expect(tip.fromUserId).toEqual(sender.id);
    expect(tip.toUserId).toEqual(recipient.id);
    expect(tip.amount).toEqual(5.5);
    expect(tip.message).toEqual('Great post!');
  });

  it('should validate that the amount is greater than 0', async () => {
    await expect(
      Tip.create({
        fromUserId: sender.id,
        toUserId: recipient.id,
        amount: -1, // Invalid amount
        message: 'Invalid tip',
      })
    ).rejects.toThrow('Tip amount must be greater than 0.');
  });

  it('should handle missing optional message field', async () => {
    const tip = await Tip.create({
      fromUserId: sender.id,
      toUserId: recipient.id,
      amount: 2.5,
    });

    expect(tip.message).toBeNull(); // Default message should be null
  });

  it('should cascade delete tips when the sender is deleted', async () => {
    const tip = await Tip.create({
      fromUserId: sender.id,
      toUserId: recipient.id,
      amount: 3.0,
      message: 'Thanks!',
    });

    expect(tip).toBeDefined();

    await sender.destroy(); // Delete sender

    const deletedTip = await Tip.findOne({ where: { id: tip.id } });
    expect(deletedTip).toBeNull(); // Tip should also be deleted
  });

  it('should cascade delete tips when the recipient is deleted', async () => {
    const tip = await Tip.create({
      fromUserId: sender.id,
      toUserId: recipient.id,
      amount: 4.0,
      message: 'Nice work!',
    });

    expect(tip).toBeDefined();

    await recipient.destroy(); // Delete recipient

    const deletedTip = await Tip.findOne({ where: { id: tip.id } });
    expect(deletedTip).toBeNull(); // Tip should also be deleted
  });
});