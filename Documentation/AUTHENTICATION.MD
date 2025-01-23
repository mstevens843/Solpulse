# Authentication

This document provides an overview of the authentication system used in the Crypto Social Platform. We use JWT (JSON Web Token) for session management and protect routes to ensure only authenticated users can access specific resources.

## Overview

### JWT Authentication

1. **Registration**: 
   - Route: `/api/auth/register`
   - Method: `POST`
   - Validates incoming user details, hashes the password, and creates a new user.
   - A JWT is created upon successful registration and returned to the user.

2. **Login**: 
   - Route: `/api/auth/login`
   - Method: `POST`
   - Checks if the user exists and validates the password.
   - If successful, it generates a JWT that the user can
use for future authenticated requests.

3. **Token Generation**:
   - The JWT token is generated using the `jsonwebtoken` package and is signed with a secret key stored in the environment variables (`JWT_SECRET`). The token contains the user ID as the payload.

4. **Token Storage**:
   - Upon login, the JWT is stored in `localStorage` on the client side. The client includes this token in the `Authorization` header of each request to access protected routes.

### Protected Routes

- **Middleware**: 
  - The `authMiddleware` function is used to protect routes. It checks for the JWT in the `Authorization` header, verifies its validity, and attaches the decoded user information to the request object.
- **Usage**: This middleware is applied to routes where authentication is required, such as creating posts, sending messages, or updating profile settings.

## Error Handling

For authentication-related errors (e.g., invalid credentials, token expiration), responses are handled with appropriate status codes and messages for better client-side handling.

---

### `MESSAGES.md`

```markdown
# Messaging System

The Messaging system allows users to send direct messages to each other. It includes an optional crypto tipping functionality.

## Overview

### Messages Model

The `Message` model stores each message with fields for `senderId`, `recipientId`, `content`, and `cryptoTip`.

### API Routes

1. **Fetch Messages**:
   - Route: `/api/messages`
   - Method: `GET`
   - Retrieves all messages for the logged-in user.
   - Uses the `authMiddleware` to ensure only authenticated users can access their messages.

2. **Send Message**:
   - Route: `/api/messages`
   - Method: `POST`
   - Sends a new message to a specified recipient.
   - Allows for an optional `cryptoTip` amount.

3. **Real-Time Update**:
   - The system polls for new messages on the frontend using `useEffect` with `axios.get` on a timer to mimic real-time functionality.
   - WebSocket integration is a potential future enhancement for more efficient real-time communication.

## Error Handling

Each message-related operation includes error handling to log errors and provide user-friendly error messages.

---

### `CRYPTO_TRADING.md`

```markdown
# Crypto Trading

This document outlines the crypto trading functionality, which allows users to trade Solana ecosystem coins directly from the platform.

## Overview

### Crypto Trading API

1. **Fetch Trending Coins**:
   - Endpoint: `/api/trendingCrypto`
   - Method: `GET`
   - Returns a list of trending Solana ecosystem coins.
   - Uses the CoinGecko API to retrieve data and cache it on our server to reduce API call frequency.

2. **Trade Crypto**:
   - Endpoint: `/api/trade`
   - Method: `POST`
   - Allows the user to place a trade order (e.g., buy or sell).
   - The request includes the `selectedCoin`, trade amount, and order type.

3. **Balance & Transactions**:
   - Fetches the user's crypto wallet balance and recent transactions, providing a summary view on the `Dashboard` page.

### Security and Validations

All trading routes are protected using `authMiddleware` to ensure only authenticated users can initiate trades. Amount validation and request signing are implemented for secure transactions.

---

### `NOTIFICATIONS.md`

```markdown
# Notifications

This document describes how the notifications system works to keep users informed of their interactions.

## Overview

The notifications system alerts users of various activities, such as:

- New followers
- Likes on posts
- Comments on posts
- Crypto transactions

### Notification Model

Each notification has fields for `userId`, `type` (like, follow, comment, transaction), `message`, `relatedEntityId` (optional ID of the associated entity, such as a post or user), and `isRead` status.

### API Routes

1. **Fetch Notifications**:
   - Route: `/api/notifications`
   - Method: `GET`
   - Retrieves all notifications for the logged-in user.
   - Uses `authMiddleware` to restrict access to authenticated users only.

2. **Mark Notification as Read**:
   - Route: `/api/notifications/:id/read`
   - Method: `PATCH`
   - Marks a specific notification as read.

### Real-Time Updates

Notifications are refreshed periodically on the client side, allowing the user to see new notifications without needing to reload the page.

### Error Handling

All notification operations include error handling to log errors and provide clear feedback to the user in case of issues.

---

### `SEARCH.md`

```markdown
# Search Functionality

The Search page provides the capability to search for posts, users, and other crypto-related content.

## Overview

1. **Search Query**:
   - The search query is passed as a query parameter (`/api/search?query=<search_term>`).
   - On the server side, it uses Sequelize's `Op.like` operator to match the search term to usernames, post content, and crypto tags.

2. **Search Results**:
   - Results are categorized by type (users or posts) and returned to the client.
   - The `SearchResults` page displays these results using `UserCard` and `Post` components.

3. **API Routes**

   - **Search Users and Posts**:
     - Endpoint: `/api/search`
     - Method: `GET`
     - Accepts a query parameter to search by usernames, post content, or crypto tags.
     - Returns a structured response with matched users and posts.

4. **Error Handling**

   Errors encountered during search operations are logged and returned with user-friendly messages to improve the user experience.

---

### `SETTINGS.md`

```markdown
# User Settings

This document describes the settings page functionality, which allows users to manage their account details, privacy, and crypto wallet.

## Overview

1. **Editable Fields**:
   - `Email`: Users can update their email.
   - `Password`: Password can be updated with validation.
   - `Privacy Settings`: Choose between public and private account settings.
   - `Wallet Address`: Link or update the crypto wallet address.

2. **API Routes**

   - **Update Settings**:
     - Endpoint: `/api/users/settings`
     - Method: `PUT`
     - Accepts the user's updated email, password, privacy setting, and wallet address.
     - Requires authentication via `authMiddleware`.

3. **Frontend Components**

   - **NotificationBell**: Alerts users to new updates.
   - **CryptoWallet**: Displays the user's wallet information and balance.

4. **Error Handling**

   Includes robust error handling to display clear messages if settings updates fail.

---

These `.md` files provide a comprehensive breakdown of the primary features and functionalities in your application, making it easier for developers and collaborators to understand the system's inner workings.
