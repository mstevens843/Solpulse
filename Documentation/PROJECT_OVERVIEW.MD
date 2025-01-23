# Project Overview

## Project Title: Crypto Social Media Platform

### Purpose
The Crypto Social Media Platform is a full-stack application allowing users to engage in a crypto-focused social media experience. Users can:
- Post and engage with content
- Send direct messages (with optional crypto tips)
- Manage their personal settings, wallet, and account privacy
- Track real-time crypto data for coins in the Solana ecosystem

### Core Features
1. **User Authentication**: Register, login, and token-based authentication.
2. **Crypto Integration**: Wallet management and real-time crypto data.
3. **Social Features**: Follow users, like posts, and comment.
4. **Messaging**: Direct messaging with optional crypto tipping.
5. **Notifications**: Real-time notifications for interactions.
6. **Trending Solana Coins**: Display and track Solana ecosystem coins using CoinGecko API.

### Technologies Used
- **Backend**: Node.js, Express, Sequelize, PostgreSQL
- **Frontend**: React, Axios, React Router
- **APIs**: CoinGecko API (for crypto data)
- **Authentication**: JWT for secure login
- **Deployment**: Vercel/Netlify for frontend and Render/Heroku for backend

This platform offers an engaging crypto-focused social network with real-time data integration.


# Project Structure

The project is organized into separate backend and frontend folders:



## Frontend Structure


## Key Project Files
- `.env` - Stores environment variables (API keys, JWT secrets, etc.)
- `README.md` - Main project documentation with setup instructions
- `package.json` - Defines dependencies, scripts, and project metadata


###### Authentication

## Overview
The authentication system uses JWT for secure login and session management. Users can:
1. Register an account
2. Log in to receive a token
3. Use the token for protected routes

### 1. Registration
- `POST /api/auth/register`: Allows users to register with username, email, and password.
- **Process**:
  - Hashes the password using bcrypt
  - Saves user details to the database
  - Generates a JWT token for immediate login

### 2. Login
- `POST /api/auth/login`: Authenticates users by email and password.
- **Process**:
  - Checks credentials
  - Generates JWT token
  - Returns the token to the client

### 3. Token Middleware
- `authMiddleware`: Verifies JWT for protected routes, ensuring only logged-in users access sensitive data.

### 4. Protecting Routes
- Sensitive routes (e.g., `/api/posts`, `/api/messages`) use `auth







###### Crypto Integration

## Purpose
Crypto integration allows users to:
1. View real-time prices for Solana ecosystem coins
2. Manage crypto wallets
3. Send crypto tips in direct messages

### 1. TrendingCrypto Page
- **API**: Fetches Solana coin data using CoinGecko.
- **Backend**: `/api/trendingCrypto` serves this data to the frontend.
- **Frontend Component**: `CryptoTicker` shows price and market cap for Solana ecosystem coins.

### 2. Wallet Management
- **Model**: `Wallet` (stores user crypto wallet addresses and balances).
- **API**: `/api/wallet` enables linking and fetching wallet information.
- **Frontend Component**: `CryptoWallet` displays wallet balance and history.

### 3. Crypto Tipping in Messages
- **Process**:
  - Users can include a `cryptoTip` in messages.
  - **Model**: `Message` includes `cryptoTip` field.
  - **Frontend**: Input field for tipping in `Messages` page.




##### Social Features

## Overview
The platform supports core social media interactions, including:
1. Following users
2. Posting content with hashtags
3. Liking and commenting on posts
4. Notifications for interactions

### 1. Following Users
- **Backend**:
  - Follower model tracks relationships.
  - Routes like `/api/users/:id/followers` and `/api/users/:id/following` manage followers.
- **Frontend**: `FollowButton` component allows follow/unfollow actions.

### 2. Posting Content
- **Backend**:
  - `POST /api/posts` allows users to create posts.
  - Users can tag posts with hashtags and upload media.
- **Frontend**:
  - `PostCreation` page to write content, add crypto hashtags, and upload media.

### 3. Liking & Commenting
- **Backend**: 
  - Routes `/api/posts/:id/like` and `/api/posts/:id/comment` enable liking and commenting.
- **Frontend**:
  - `LikeButton` and `CommentSection` for post interactions.

### 4. Notifications
- **Backend**: Notifications model tracks interactions.
- **Frontend**: `NotificationBell` component shows unread notifications.





###### Messaging Feature

## Overview
The messaging system allows users to:
1. Send and receive direct messages
2. Send optional crypto tips in messages

### 1. Messaging Model
- **Fields**: `senderId`, `recipientId`, `content`, `cryptoTip`.
- **Relationships**: Linked to users (sender and recipient).

### 2. Sending Messages
- **Route**: `POST /api/messages` handles message creation.
- **Frontend**:
  - `Messages` page displays message history and includes form for sending messages with optional crypto tips.

### 3. Viewing Messages
- **Route**: `GET /api/messages` fetches message history for the user.
- **Frontend**: `MessagePreview` shows message summaries.

### 4. Crypto Tipping
- **Functionality**: Users can include a crypto tip in messages.
- **Field**: `cryptoTip` in the Message model.




###### Notifications Feature

## Overview
The notifications feature alerts users to interactions, such as:
1. New followers
2. Likes on posts
3. Comments on posts
4. Crypto transactions

### 1. Notifications Model
- **Fields**: `userId`, `type`, `message`, `actor` (user who triggered the notification).
- **Type**: Different types like `like`, `comment`, `follow`, `transaction`.

### 2. Backend API
- **Route**: `GET /api/notifications` fetches notifications for the user.

### 3. Frontend Components
- **NotificationBell**: Displays unread notification count.
- **Notifications Page**: Lists detailed notifications.

### 4. Real-Time Updates (Future Feature)
- Using websockets or polling to implement real-time notification updates.





###### Frontend Routing

## Overview
Frontend routing is set up using `React Router` to handle navigation between different pages.

### 1. App Component (App.js)
- Defines main routes for the application, such as:
  - `/` - Home page
  - `/login` - Login page
  - `/register` - Register page
  - `/profile/:id` - Profile page
  - `/messages` - Messages page
  - `/notifications` - Notifications page
  - `/trending` - TrendingCrypto page

### 2. Protected Routes
- **Function**: Ensure only authenticated users can access certain pages.
- **Implementation**: Wrap protected components with `AuthRoute`, which redirects to `/login` if the user isn’t authenticated.

### 3. Dynamic Routes
- **Examples**:
  - `/profile/:id`: Displays profile based on `userId` in the URL.
  - `/post/:id`: Displays a single post and its details based on `postId`.
