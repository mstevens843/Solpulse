/**
 * Crypto Trading API - SolPulse
 * 
 * Handles:
 * - Simulated crypto trades (buy/sell).
 * - Validating trade input data.
 * - Mock response to simulate a trade execution.
 */


const express = require('express');
const router = express.Router();
const axios = require('axios');
const { check, validationResult } = require('express-validator'); 
require('dotenv').config();

/**
 * @route   POST /
 * @desc    Execute a crypto trade using the Coinbase API or mock response
 * @access  Public
 */
router.post(
    '/',
    [
        // Validate input fields
        check('cryptoType', 'Crypto type is required').not().isEmpty(),
        check('amount', 'Amount must be a positive number').isFloat({ gt: 0 }),
        check('tradeType', 'Trade type must be either "buy" or "sell"').isIn(['buy', 'sell']),
    ],
    async (req, res) => {
        console.log("POST /api/trade route is hit"); // Log route hit

        // Use validationResult to check if validation failed
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log("Validation errors:", errors.array()); // Log validation errors
            return res.status(400).json({ errors: errors.array() }); // Send back validation errors
        }

        const { cryptoType, amount, tradeType } = req.body;
        console.log(`Request body: cryptoType=${cryptoType}, amount=${amount}, tradeType=${tradeType}`); // Log incoming data

        try {
            console.log('Attempting to execute trade...');
            // Mocked response for testing purposes
            const result = {
                data: {
                    trade: {
                        type: tradeType,
                        amount: amount,
                        currency: cryptoType,
                        status: 'success',
                        tradeId: 'mock123456789',
                        timestamp: new Date().toISOString(),
                    },
                },
            };

            console.log("Mock trade response:", result); // Log mock response

            // Respond with success message and mock trade details
            res.status(200).json({
                message: `Successfully executed ${tradeType} of ${amount} ${cryptoType}.`, // Fixed template literals
                tradeDetails: result.data.trade, // Mock trade details
            });
        } catch (error) {
            console.error('Error caught:', error);
        
            if (error.response) {
                console.error('Error response received:', error.response.data);
                return res.status(error.response.status).json({
                    message: 'An unexpected error occurred while executing the trade.',
                    error: error.response.data.message || 'Unknown error from API.',
                });
            } else if (error.request) {
                console.error('No response received from API:', error.request);
                return res.status(500).json({
                    message: 'An unexpected error occurred while executing the trade.',
                    error: 'No response from the API.',
                });
            } else {
                console.error('Error during request setup:', error.message);
                return res.status(500).json({
                    message: 'An unexpected error occurred while executing the trade.',
                    error: error.message,
                });
            }
        }
        
    }
);

// Catch-all route for debugging
router.use('*', (req, res) => {
    console.log(`No route found for ${req.method} ${req.originalUrl}`); // Fixed template literals
    res.status(404).json({ error: 'Route not found!' });
});

module.exports = router;


/**
 * Potential Issues & Optimizations
✅ 🚀 Real API Integration (Instead of Mock Response)

Problem: Currently, all trades return a static mock response.
Solution: Integrate an actual API like Coinbase, Binance, or Jupiter to execute real trades.
✅ 🔐 Security Concern

Problem: This endpoint does not require authentication, allowing anyone to trigger trades.
Solution: Add authMiddleware to require users to be logged in.
✅ 📉 Input Validation Improvement

Problem: cryptoType isn't validated against a list of valid cryptocurrencies.
Solution: Add an allowed list (BTC, SOL, ETH, etc.) to avoid invalid inputs.

 */