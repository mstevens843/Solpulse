// simple test to ensure the connection to the database works correctly by mocking sequelize.authenticate().

const sequelize = require('./db'); // Import the sequelize instance
jest.mock('sequelize', () => {
  const actualSequelize = jest.requireActual('sequelize');
  return {
    ...actualSequelize,
    Sequelize: jest.fn().mockImplementation(() => ({
      authenticate: jest.fn().mockResolvedValue('Connected'),
    })),
  };
});

describe('Database connection', () => {
  it('should establish a connection successfully', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {}); // Mock console log

    await sequelize.authenticate();

    // Ensure authenticate method was called
    expect(sequelize.authenticate).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith('Database connection established successfully.');

    logSpy.mockRestore(); // Restore the original console log method
  });

  it('should fail to connect if database connection is invalid', async () => {
    sequelize.authenticate.mockRejectedValueOnce(new Error('DB connection error'));

    const logErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // Mock error logging

    await expect(sequelize.authenticate()).rejects.toThrow('Unable to connect to the database: DB connection error');
    expect(logErrorSpy).toHaveBeenCalledWith('Unable to connect to the database:', expect.any(Error));

    logErrorSpy.mockRestore(); // Restore the original console error method
  });
});