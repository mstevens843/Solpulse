const express = require('express');
const { Transaction, Wallet } = require('../models/Index'); // Import models
const { check, validationResult } = require('express-validator'); // For input validation
const authMiddleware = require('../middleware/auth'); // JWT authentication middleware
const router = express.Router();

/**
 * @route   GET /api/transactions/wallet/:walletAddress
 * @desc    Fetch all transactions for a specific wallet address
 * @access  Private
 */
router.get('/wallet/:walletAddress', authMiddleware, async (req, res) => {
    const { walletAddress } = req.params;

    try {
        const wallet = await Wallet.findOne({ where: { address: walletAddress } });
        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        const transactions = await Transaction.findAll({
            where: { walletId: wallet.id },
            order: [['createdAt', 'DESC']],
        });

        res.json({ transactions });
    } catch (err) {
        console.error('Error fetching transactions:', err);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

/**
 * @route   GET /api/transactions
 * @desc    Fetch all transactions for the authenticated user's wallets
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const wallets = await Wallet.findAll({ where: { userId: req.user.id } });

        if (!wallets.length) {
            return res.status(404).json({ error: 'No wallets found for the user.' });
        }

        const walletIds = wallets.map(wallet => wallet.id);

        const transactions = await Transaction.findAll({
            where: { walletId: walletIds },
            order: [['createdAt', 'DESC']],
        });

        res.json({ transactions });
    } catch (err) {
        console.error('Error fetching user transactions:', err);
        res.status(500).json({ error: 'Failed to fetch transactions.' });
    }
});

/**
 * @route   POST /api/transactions
 * @desc    Add a new transaction (deposit or withdrawal)
 * @access  Private
 */
router.post(
    '/',
    [
        authMiddleware,
        check('walletId', 'Wallet ID is required').not().isEmpty(),
        check('amount', 'Amount must be a positive number').isFloat({ gt: 0 }),
        check('type', 'Transaction type must be "deposit" or "withdrawal"').isIn(['deposit', 'withdrawal']),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { walletId, amount, type } = req.body;

        try {
            // Validate wallet ownership
            const wallet = await Wallet.findOne({ where: { id: walletId, userId: req.user.id } });
            if (!wallet) {
                console.error('Wallet not found or unauthorized access');
                return res.status(403).json({ error: 'Unauthorized or wallet not found' });
            }

            // Create a new transaction
            const transaction = await Transaction.create({
                walletId,
                amount,
                type,
                userId: req.user.id,
                walletAddress: wallet.address, // Ensure walletAddress is stored
            });

            res.status(201).json({
                message: 'Transaction successfully created',
                transaction,
            });
        } catch (err) {
            console.error('Error creating transaction:', err);
            res.status(500).json({ error: 'Failed to create transaction' });
        }
    }
);


module.exports = router;