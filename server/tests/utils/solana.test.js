const { getWalletBalance, lamportsToSol } = require('../utils'); // Import functions to test
const solanaWeb3 = require('@solana/web3.js');

// Mock the Solana Web3 connection and methods
jest.mock('@solana/web3.js', () => {
  const actualSolanaWeb3 = jest.requireActual('@solana/web3.js');
  return {
    ...actualSolanaWeb3,
    Connection: jest.fn().mockImplementation(() => {
      return {
        getBalance: jest.fn(),
      };
    }),
  };
});

describe('Utility functions', () => {
  describe('getWalletBalance', () => {
    it('should fetch wallet balance and convert lamports to SOL', async () => {
      const mockBalance = 1000000000; // 1 SOL in lamports
      const mockPublicKey = 'mockPublicKey';
      const mockConnection = new solanaWeb3.Connection();
      
      // Mock the Solana connection's getBalance method to return the mock balance
      mockConnection.getBalance.mockResolvedValue(mockBalance);

      // Mock the solanaWeb3.PublicKey method
      solanaWeb3.PublicKey = jest.fn().mockReturnValue(mockPublicKey);
      
      // Call getWalletBalance with a mock wallet address
      const result = await getWalletBalance(mockPublicKey);

      // Verify that getBalance was called with the correct public key
      expect(mockConnection.getBalance).toHaveBeenCalledWith(mockPublicKey);

      // Convert lamports to SOL (1000000000 lamports = 1 SOL)
      const expectedBalance = lamportsToSol(mockBalance);

      // Verify the result is the correct SOL value
      expect(result).toBe(expectedBalance);
    });

    it('should throw an error if the wallet address is invalid', async () => {
      // Mocking the case for invalid public key input
      solanaWeb3.PublicKey = jest.fn().mockImplementation(() => {
        throw new Error('Invalid public key input');
      });

      await expect(getWalletBalance('invalidWalletAddress')).rejects.toThrow('Invalid wallet address. Please check the input.');
    });

    it('should throw an error if wallet address is missing', async () => {
      await expect(getWalletBalance('')).rejects.toThrow('Wallet address is required');
    });
  });

  describe('lamportsToSol', () => {
    it('should convert lamports to SOL correctly', () => {
      const lamports = 1000000000; // 1 SOL in lamports
      const sol = lamportsToSol(lamports);
      expect(sol).toBe(1); // 1 SOL
    });

    it('should handle zero lamports', () => {
      const lamports = 0;
      const sol = lamportsToSol(lamports);
      expect(sol).toBe(0); // 0 SOL
    });
  });
});
