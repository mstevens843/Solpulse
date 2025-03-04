const express = require('express');
const { Wallet } = require('../../models/Index');
const authMiddleware = require('../../middleware/auth'); 
const { getWalletBalance } = require('../../utils/solana'); 
const router = express.Router();

/**
 * Add a new wallet for the authenticated user
 */
router.post('/', authMiddleware, async (req, res) => {
    const { address } = req.body;

    try {
        // Validate address format
        if (!address || typeof address !== 'string' || address.length === 0) {
            return res.status(400).json({ error: 'Invalid wallet address' });
        }

        // Check if wallet already exists
        const existingWallet = await Wallet.findOne({ where: { address } });
        if (existingWallet) {
            return res.status(400).json({ error: 'Wallet already exists' });
        }

        // Create new wallet
        const newWallet = await Wallet.create({
            userId: req.user.id,
            address,
        });

        res.status(201).json({ message: 'Wallet added successfully', wallet: newWallet });
    } catch (err) {
        console.error('Error adding wallet:', err);
        res.status(500).json({ error: 'Failed to add wallet' });
    }
});

/**
 * Get all wallets for the authenticated user
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const wallets = await Wallet.findAll({ where: { userId: req.user.id } });

        if (wallets.length === 0) {
            return res.status(404).json({ message: 'No wallets found for this user.' });
        }

        res.json({ wallets });
    } catch (err) {
        console.error('Error fetching wallets:', err);
        res.status(500).json({ error: 'Failed to fetch wallets' });
    }
});


router.get('/transactions/:address', authMiddleware, async (req, res) => {
    const { address } = req.params;
  
    try {
      const transactions = await getWalletTransactions(address);
      res.json({ transactions });
    } catch (err) {
      console.error("❌ Error fetching transactions:", err.message);
      res.status(500).json({ error: "Failed to fetch transactions." });
    }
  });

/**
 * Get the balance of a specific wallet along with dummy transactions
 */
router.get('/balance/:address', authMiddleware, async (req, res) => {
    const { address } = req.params;

    try {
        // Ensure the address has a valid format
        const isValidAddress = /^[a-zA-Z0-9]{32,44}$/.test(address);
        if (!isValidAddress) {
            return res.status(400).json({ error: 'Invalid wallet address' });
        }

        const balance = await getWalletBalance(address);
        const transactions = [
            { id: 1, amount: 2.5, type: 'Deposit', date: new Date().toISOString() },
            { id: 2, amount: 1.0, type: 'Withdrawal', date: new Date().toISOString() },
        ];

        res.json({ address, balance, transactions });
    } catch (err) {
        console.error('Error fetching wallet data:', err);
        res.status(500).json({ error: 'Failed to fetch wallet data.' });
    }
});


router.put('/link', authMiddleware, async (req, res) => {
    const { address } = req.body;

    try {
        if (!address || typeof address !== 'string' || address.length === 0) {
            return res.status(400).json({ error: 'Invalid wallet address' });
        }

        // Check if the wallet already exists and belongs to a different user
        const existingWallet = await Wallet.findOne({ where: { address } });
        if (existingWallet && existingWallet.userId !== req.user.id) {
            return res.status(400).json({ error: 'Wallet address already linked to another user.' });
        }

        // Update or add wallet address to user profile
        let wallet = await Wallet.findOne({ where: { userId: req.user.id } });
        if (wallet) {
            wallet.address = address;
            await wallet.save();
        } else {
            wallet = await Wallet.create({ userId: req.user.id, address });
        }

        res.json({ message: 'Wallet linked successfully', wallet });
    } catch (err) {
        console.error('Error linking wallet:', err);
        res.status(500).json({ error: 'Failed to link wallet to profile' });
    }
});

/**
 * Get a user's linked wallet address
 */
router.get('/linked', authMiddleware, async (req, res) => {
    try {
        const wallet = await Wallet.findOne({ where: { userId: req.user.id } });

        if (!wallet) {
            return res.status(404).json({ message: 'No linked wallet found.' });
        }

        res.json({ wallet });
    } catch (err) {
        console.error('Error fetching linked wallet:', err);
        res.status(500).json({ error: 'Failed to fetch linked wallet' });
    }
});





module.exports = router;