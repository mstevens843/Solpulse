const http = require('http');
const { Server } = require('socket.io');
const server = require('./server'); // The actual server module
const sequelize = require('./models/Index'); // Sequelize connection

jest.mock('http');
jest.mock('socket.io');
jest.mock('./models/Index');
jest.mock('./app'); // Mock app if necessary

describe('Server Initialization', () => {
  let serverInstance;
  let socketIoInstance;

  beforeAll(() => {
    serverInstance = { listen: jest.fn() };
    socketIoInstance = { close: jest.fn() };
    http.createServer.mockReturnValue(serverInstance);
    Server.mockReturnValue(socketIoInstance);

    sequelize.sequelize.authenticate.mockResolvedValue(); // Mock successful DB connection
  });

  afterAll(() => {
    jest.restoreAllMocks(); // Restore the original functions after tests
  });

  it('should start the server', () => {
    require('./server'); // Run server.js

    expect(http.createServer).toHaveBeenCalledTimes(1);
    expect(serverInstance.listen).toHaveBeenCalledWith(expect.any(Number), expect.any(Function));
  });

  it('should authenticate with the database', async () => {
    await require('./server'); // Run server.js

    expect(sequelize.sequelize.authenticate).toHaveBeenCalledTimes(1);
  });

  it('should exit on database connection failure', async () => {
    sequelize.sequelize.authenticate.mockRejectedValue(new Error('DB connection error'));

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

    await require('./server'); // Run server.js

    expect(sequelize.sequelize.authenticate).toHaveBeenCalledTimes(1);
    expect(exitSpy).toHaveBeenCalledWith(1); // Process should exit with code 1

    exitSpy.mockRestore();
  });

  it('should gracefully shutdown the server', async () => {
    const shutdownSpy = jest.spyOn(serverInstance, 'close').mockImplementation((cb) => cb());
    const closeSocketSpy = jest.spyOn(socketIoInstance, 'close').mockImplementation((cb) => cb());

    await require('./server'); // Run server.js

    // Simulate shutdown signal
    process.emit('SIGTERM');
    await new Promise((resolve) => setTimeout(resolve, 50)); // Give it time to process

    expect(shutdownSpy).toHaveBeenCalled();
    expect(closeSocketSpy).toHaveBeenCalled();
  });
});
