const { setSocket, validateAndBroadcast, sendToClient, setupErrorHandling } = require('../utils/websocket');
const ioMock = {
  emit: jest.fn(),
  sockets: {
    sockets: new Map(),
    get: jest.fn(),
  },
};
const socketMock = {
  id: 'socketId1',
  emit: jest.fn(),
};

describe('WebSocket Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ioMock.sockets.sockets.clear();
  });

  describe('setSocket', () => {
    it('should initialize WebSocket server', () => {
      setSocket(ioMock);
      expect(ioMock).toBeDefined();
    });

    it('should prevent multiple initializations', () => {
      setSocket(ioMock);
      setSocket(ioMock); // Called twice

      expect(console.warn).toHaveBeenCalledWith('WebSocket server is already initialized.');
    });
  });

  describe('validateAndBroadcast', () => {
    it('should broadcast an event if WebSocket server is initialized', () => {
      setSocket(ioMock);
      validateAndBroadcast('testEvent', { data: 'test' });

      expect(ioMock.emit).toHaveBeenCalledWith('testEvent', { data: 'test' });
      expect(console.log).toHaveBeenCalledWith("Event 'testEvent' broadcasted to all clients.");
    });

    it('should log an error if WebSocket server is not initialized', () => {
      validateAndBroadcast('testEvent', { data: 'test' });

      expect(console.error).toHaveBeenCalledWith('WebSocket server is not initialized.');
    });

    it('should log an error if event name is invalid', () => {
      setSocket(ioMock);
      validateAndBroadcast('', { data: 'test' });

      expect(console.error).toHaveBeenCalledWith('Invalid event name');
    });
  });

  describe('sendToClient', () => {
    it('should send event to specific client by socketId', () => {
      setSocket(ioMock);
      ioMock.sockets.sockets.set(socketMock.id, socketMock);
      sendToClient(socketMock.id, 'testEvent', { data: 'test' });

      expect(socketMock.emit).toHaveBeenCalledWith('testEvent', { data: 'test' });
      expect(console.log).toHaveBeenCalledWith(`Event 'testEvent' sent to client with ID '${socketMock.id}'.`);
    });

    it('should log an error if client not found', () => {
      setSocket(ioMock);
      sendToClient('nonExistentSocketId', 'testEvent', { data: 'test' });

      expect(console.warn).toHaveBeenCalledWith("Client with ID 'nonExistentSocketId' not found.");
    });

    it('should log an error if WebSocket server is not initialized', () => {
      sendToClient(socketMock.id, 'testEvent', { data: 'test' });

      expect(console.error).toHaveBeenCalledWith('WebSocket server is not initialized.');
    });

    it('should log an error if event name is invalid', () => {
      setSocket(ioMock);
      sendToClient(socketMock.id, '', { data: 'test' });

      expect(console.error).toHaveBeenCalledWith('Invalid event name');
    });
  });

  describe('setupErrorHandling', () => {
    it('should log WebSocket errors and setup event listeners', () => {
      setSocket(ioMock);
      setupErrorHandling();

      // Simulate socket error event
      ioMock.emit('error', 'Test error');
      expect(console.error).toHaveBeenCalledWith('WebSocket error on socket socketId1:', 'Test error');
      expect(console.log).toHaveBeenCalledWith('WebSocket error handling set up.');
    });

    it('should log an error if WebSocket server is not initialized', () => {
      setupErrorHandling();

      expect(console.error).toHaveBeenCalledWith('WebSocket server is not initialized.');
    });
  });
});



// Test Breakdown:
// setSocket:

// Ensures the WebSocket server is initialized correctly and prevents multiple initializations.
// validateAndBroadcast:

// Tests that the event is broadcast correctly if the server is initialized and validates the event name.
// sendToClient:

// Ensures that an event is sent to a client and handles errors when the client is not found or the server isn't initialized.
// setupErrorHandling:

// Ensures that errors are logged and handled correctly when the WebSocket emits errors.