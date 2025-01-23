const express = require('express');

// Import individual route modules
const authRoutes = require('./auth');
const walletRoutes = require('./wallet');
const postRoutes = require('./posts');
const commentRoutes = require('./comments');
const tipRoutes = require('./tips');
const userRoutes = require('./users');
const transactionRoutes = require('./transactions');
const tradeRoutes = require('./trade'); // Correct import of trade.js
const messageRoutes = require('./messages'); // Added messages route
const notificationRoutes = require('./notifications'); // Added notifications route
const trendingCryptoRoutes = require('./trendingCrypto'); // Added trendingCrypto route
const searchRoutes = require('./search'); // Added search route
const testRoutes = require('./test'); // Import the test route
const testWebSocketRouter = require("./test-websocket");


const router = express.Router();

/** 
 * Centralized Route Registration
 * Each route is mounted on a specific base path.
 */

// Log to confirm that routes are being registered
console.log("Registering routes...");

router.use('/auth', authRoutes); // Authentication and authorization
router.use('/wallet', walletRoutes); // Wallet operations (e.g., balance, transactions)
router.use('/posts', postRoutes); // Posts (e.g., create, update, fetch)
router.use('/comments', commentRoutes.router); // Comments and WebSocket logic
console.log(commentRoutes);
router.use('/tips', tipRoutes); // Tipping functionality
router.use('/users', userRoutes); // User profile and account management
router.use('/transactions', transactionRoutes); // Transactions and history
router.use('/trade', tradeRoutes); // Trading-related routes
router.use("/socket", testWebSocketRouter);



// Log when the /trade route is registered
console.log('/trade route successfully registered');

router.use('/messages', messageRoutes); // Added messages functionality
router.use('/notifications', notificationRoutes); // Added notifications functionality
router.use('/trendingCrypto', trendingCryptoRoutes); // Register /trendingCrypto route
console.log('/trendingCrypto route successfully registered');

router.use('/search', searchRoutes); // Added search functionality
router.use('/test', testRoutes); // Register the test route

// Catch-all route for debugging
router.use('*', (req, res) => {
    console.log(`No route found for ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Route not found!' });
});

module.exports = router;
