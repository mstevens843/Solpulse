import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import CryptoTrade from '../../Archive/CryptoTrade';
import Loader from '../../components/Loader';

// Mocking axios
jest.mock('axios');
jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: jest.fn(),
  useConnection: jest.fn(),
}));

jest.mock('../../components/Loader', () => () => <div>Loading...</div>);

describe('CryptoTrade Component', () => {
  const mockSelectedCoin = 'solana';

  // Mocks for useWallet and useConnection
  const mockWallet = {
    connected: true,
    publicKey: {
      toBase58: jest.fn().mockReturnValue('fakePublicKey'),
    },
  };
  const mockConnection = {
    getBalance: jest.fn().mockResolvedValue(1000000000), // 1 SOL in lamports
  };

  beforeEach(() => {
    useWallet.mockReturnValue(mockWallet);
    useConnection.mockReturnValue({ connection: mockConnection });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<CryptoTrade selectedCoin={mockSelectedCoin} />);

    expect(screen.getByText('Trade SOLANA')).toBeInTheDocument();
    expect(screen.getByLabelText('Select trade type')).toBeInTheDocument();
    expect(screen.getByLabelText('Enter trade amount in SOL')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Buy SOLANA/i })).toBeInTheDocument();
  });

  it('fetches and displays the current price', async () => {
    axios.get.mockResolvedValueOnce({ data: { price: 100 } });

    render(<CryptoTrade selectedCoin={mockSelectedCoin} />);

    await waitFor(() => {
      expect(screen.getByText('Current Price: $100.00 USD')).toBeInTheDocument();
    });
  });

  it('fetches and displays wallet balance', async () => {
    render(<CryptoTrade selectedCoin={mockSelectedCoin} />);

    await waitFor(() => {
      expect(screen.getByText('Your Wallet Balance: 1.0000 SOL')).toBeInTheDocument();
    });
  });

  it('executes a buy trade', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'Trade executed successfully!' } });
    axios.get.mockResolvedValueOnce({ data: { price: 100 } });

    render(<CryptoTrade selectedCoin={mockSelectedCoin} />);

    fireEvent.change(screen.getByLabelText('Enter trade amount in SOL'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: /Buy SOLANA/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/trade`,
        expect.objectContaining({
          cryptoType: 'SOLANA',
          amount: 1,
          tradeType: 'buy',
        })
      );
      expect(screen.getByText('Trade executed successfully!')).toBeInTheDocument();
    });
  });

  it('executes a sell trade', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'Trade executed successfully!' } });
    axios.get.mockResolvedValueOnce({ data: { price: 100 } });

    render(<CryptoTrade selectedCoin={mockSelectedCoin} />);

    fireEvent.change(screen.getByLabelText('Enter trade amount in SOL'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Select trade type'), { target: { value: 'sell' } });
    fireEvent.click(screen.getByRole('button', { name: /Sell SOLANA/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/trade`,
        expect.objectContaining({
          cryptoType: 'SOLANA',
          amount: 1,
          tradeType: 'sell',
        })
      );
      expect(screen.getByText('Trade executed successfully!')).toBeInTheDocument();
    });
  });

  it('handles trade execution error', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { message: 'Trade failed' } } });
    axios.get.mockResolvedValueOnce({ data: { price: 100 } });

    render(<CryptoTrade selectedCoin={mockSelectedCoin} />);

    fireEvent.change(screen.getByLabelText('Enter trade amount in SOL'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: /Buy SOLANA/i }));

    await waitFor(() => {
      expect(screen.getByText('Trade failed')).toBeInTheDocument();
    });
  });

  it('disables trade button when wallet is not connected', async () => {
    useWallet.mockReturnValue({ connected: false, publicKey: null });

    render(<CryptoTrade selectedCoin={mockSelectedCoin} />);

    expect(screen.getByRole('button', { name: /Buy SOLANA/i })).toBeDisabled();
  });

  it('disables trade button when loading', async () => {
    axios.get.mockResolvedValueOnce({ data: { price: 100 } });
    render(<CryptoTrade selectedCoin={mockSelectedCoin} />);

    // Trigger loading state
    await act(async () => {
      expect(screen.getByRole('button', { name: /Buy SOLANA/i })).toBeDisabled();
    });
  });
});
