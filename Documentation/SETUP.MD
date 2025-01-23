# Crypto Social Platform

A web application that integrates social media interactions with cryptocurrency functionality, allowing users to engage with posts, direct messages, and crypto-related content within a community. Users can follow each other, post updates, engage in direct messaging (including optional crypto tipping), and keep track of trending coins in the Solana ecosystem.

---

## Features

### General Features
- **User Registration & Login**: Users can create an account, log in, and authenticate via JWT.
- **Settings Management**: Allows users to update their email, password, privacy settings, and wallet address.
- **User Profile**: Displays user profile information, bio, posts, followers, and followings. Users can also edit their bio.
- **Notifications**: Displays notifications for interactions such as likes, comments, follows, and crypto transactions.
- **Direct Messaging**: Allows users to send direct messages to each other, with an optional crypto tipping feature.
- **Trending Solana Coins**: Shows trending coins in the Solana ecosystem, with live price updates.
- **Post Creation & Interaction**: Users can create posts, add hashtags, like, comment, and share.

---

## Project Structure

### Client-Side Components

#### Pages
- **Explore**: Displays trending posts and includes a search bar for discovering posts or users.
- **FollowersFollowing**: Displays lists of a user’s followers and the people they’re following.
- **Notifications**: Shows all notifications related to user interactions on the platform.
- **Messages**: Allows direct messaging between users with the option for crypto tips.
- **Profile**: Displays user information and posts. Users can edit their bio and follow/unfollow others.
- **Settings**: Allows users to update account settings such as email, password, privacy preferences, and wallet address.
- **TrendingCrypto**: Highlights top cryptocurrencies in the Solana ecosystem with price updates.
- **PostDetail**: Shows details of a post, including comments, likes, and options for interaction.
- **PostCreation**: Allows users to create new posts, with options to upload media and tag relevant crypto assets.

#### Components
- **CryptoWallet**: Displays the user's crypto wallet balance and transaction history.
- **NotificationBell**: Indicates unread notifications.
- **SearchBar**: Allows users to search for posts or users.
- **UserCard**: Displays user information in a card format.
- **Post**: Displays individual posts.
- **MessagePreview**: Displays a preview of direct messages.
- **CryptoTrade**: Allows users to trade crypto directly from the page.
- **CryptoTicker**: Shows real-time price changes of Solana ecosystem coins.

### Backend APIs

#### `api/auth.js`
- **/register**: User registration with validation and JWT creation.
- **/login**: User login with password authentication and JWT token generation.

#### `api/users.js`
- **/settings**: Updates user settings, including email, password, privacy, and wallet address.
- **/:id**: Fetches a user profile, including their posts.
- **/:id/followers**: Retrieves a user's followers.
- **/:id/following**: Retrieves users that a specified user is following.

#### `api/posts.js`
- **/ (POST)**: Creates a new post with content and crypto-related tags.
- **/trending**: Retrieves trending posts, ordered by the number of likes.
- **/search**: Allows for searching posts by keywords.
- **/:id**: Fetches details of a single post, including comments.

#### `api/notifications.js`
- **/**: Retrieves notifications for the logged-in user, including new followers, comments, and transactions.

#### `api/messages.js`
- **/ (GET)**: Fetches a list of direct messages for the logged-in user.
- **/ (POST)**: Sends a new direct message with an optional crypto tip.

#### `api/wallet.js`
- **/**: Allows users to add or view their wallets and fetch their balance.

#### `api/trendingCrypto.js`
- **/**: Fetches the top coins in the Solana ecosystem, with price and market cap data.

---

## Models

### User
- Stores basic user information including `username`, `email`, `password`, `bio`, and `walletAddress`.

### Post
- Stores post details, such as `content`, `userId`, and associations with comments and likes.

### Follower
- Manages relationships between users for follower/following functionality.

### Wallet
- Stores user wallet details, including `address` and `balance`.

### Notification
- Stores various notifications for user interactions on the platform.

### Message
- Stores direct messages between users, including an optional `cryptoTip`.

---

## Installation

1. **Clone the repository**:
    ```bash
    git clone <repo_url>
    cd crypto-social-platform
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Set up environment variables** in `.env` file:
    - JWT_SECRET
    - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, etc.

4. **Run the application**:
    ```bash
    npm run dev
    ```

---

## Usage

- Navigate to different pages to explore features, view notifications, send messages, and interact with other users on the platform.
- Manage account settings from the Settings page, update your profile bio, and engage in crypto trading on the TrendingCrypto page.

---

## Future Extensions
- **Crypto Tipping**: Enable users to send crypto tips directly within comments or posts.
- **Enhanced Analytics**: Add analytics for users to see engagement trends on their posts.
- **Real-Time Notifications**: Implement WebSocket for instant notifications.

---

## Acknowledgements

- CoinGecko API for cryptocurrency data
- Solana blockchain for wallet integration
- Open-source resources for React, Express, and Sequelize

---

## License

This project is licensed under the MIT License.
