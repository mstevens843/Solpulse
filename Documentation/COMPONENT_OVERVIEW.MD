# Component Overview

This document provides a summary of each component in the project. For detailed functionality, refer to individual component files.

## Main Components

### 1. **CommentSection.js**
   - Displays a list of comments on a post.
   - Allows users to add new comments.
   - Used within the `PostDetail` page to facilitate discussion.

### 2. **CryptoTicker.js**
   - Shows real-time price and market data for Solana ecosystem coins.
   - Utilizes CoinGecko API for fetching data.
   - Primarily used in the `TrendingCrypto` page.

### 3. **CryptoTip.js**
   - Displays a crypto tipping option for various interactions (e.g., in messages).
   - Enables users to tip other users in SOL when sending a message.

### 4. **CryptoTrade.js**
   - Allows users to simulate trading of Solana ecosystem coins.
   - Tied to `TrendingCrypto` page, where users can select a coin to trade.
   
### 5. **CryptoTransaction.js**
   - Displays individual transaction details in a user's wallet.
   - Used in the `Dashboard` and `Profile` pages.

### 6. **CryptoWalletIntegration.js**
   - Manages wallet linking and integration.
   - Connects the app with user wallet information, allowing balance checks and transaction listings.

### 7. **Dashboard.js**
   - The main page for logged-in users showing feed, wallet, transactions, and notifications.
   - Integrates multiple components (e.g., `CryptoWallet`, `Feed`, `NotificationBell`).

### 8. **Feed.js**
   - Displays posts from followed users.
   - Main content on the `Dashboard` page.
   
### 9. **FeedFilter.js**
   - Provides filtering options for the user's feed (e.g., sorting by date or popularity).
   - Enhances the user experience on the `Dashboard` page.
