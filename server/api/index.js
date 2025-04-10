const express = require('express');

// Import individual route modules
const authRoutes = require('./auth');
const postRoutes = require('./posts');
const commentRoutes = require('./comments');
const userRoutes = require('./users');
const tradeRoutes = require('./trade');
const messageRoutes = require('./messages');
const notificationRoutes = require('./notifications');
const trendingCryptoRoutes = require('./trendingCrypto');
const searchRoutes = require('./search');
const jupiterRoutes = require('./jupiter'); 
const followRequestRoutes = require("./followrequests");
const messageRequestRoutes = require("./messageRequests")
const router = express.Router();

/** 
 * Centralized Route Registration
 * Each route is mounted on a specific base path.
 */

// Log to confirm that routes are being registered
console.log("Registering routes...");

router.use('/auth', authRoutes); 
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes.router); 
console.log(commentRoutes);
router.use('/users', userRoutes); 
router.use('/trade', tradeRoutes); 
router.use('/jupiter', jupiterRoutes); 

// Log when the /trade route is registered
console.log('/trade route successfully registered');
console.log('/jupiter route successfully registered');

router.use('/messages', messageRoutes); 
router.use('/notifications', notificationRoutes);
router.use('/trendingCrypto', trendingCryptoRoutes);
console.log('/trendingCrypto route successfully registered');
router.use('/search', searchRoutes); 
router.use('/follow-requests', followRequestRoutes);
router.use('/message-requests', messageRequestRoutes);



// Catch-all route for debugging
router.use('*', (req, res) => {
    console.log(`No route found for ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Route not found!' });
});

module.exports = router;
