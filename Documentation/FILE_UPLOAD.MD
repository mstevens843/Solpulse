# File Upload System

The file upload system allows users to attach media files (images and videos) to posts. This feature enhances engagement by enabling users to share multimedia content.

## Overview

1. **Frontend Components**

   - **MediaUpload Component**:
     - This component provides an interface for selecting and previewing files before uploading.
     - Files are appended to a `FormData` object along with other post content.

2. **API Endpoint**

   - **Upload Media**:
     - Endpoint: `/api/posts`
     - Method: `POST`
     - The endpoint receives `FormData` with `content`, `cryptoTag`, and `media` fields.
     - The server processes and stores the media file, associating it with the relevant post.

3. **Backend Processing**

   - **Storage**:
     - Media files are saved to a designated folder on the server (e.g., `uploads/`).
   - **Database Reference**:
     - The URL/path of the uploaded file is stored in the `Post` model so that it can be accessed later.

4. **Error Handling**

   - Validation ensures that only specific file types (e.g., `.jpg`, `.png`, `.mp4`) are allowed.
   - The file size is checked to prevent excessive storage use.

## Security

File uploads are handled with security measures to avoid vulnerabilities such as malicious file uploads or file path manipulation.

---

### `WEB_SOCKETS.md`

```markdown
# WebSocket Integration

WebSocket integration enables real-time updates, such as live message notifications and trading price updates.

## Overview

1. **Purpose**:
   - WebSockets allow for bidirectional communication between the server and the client, providing real-time functionality.
   - Examples include live messaging, trading price updates, and instant notifications.

2. **Backend Setup**:
   - A WebSocket server is initialized on the backend to handle connections from clients.
   - Routes such as `/ws/messages` for messaging notifications and `/ws/notifications` for other alerts are established.

3. **Frontend Implementation**:
   - The frontend uses WebSocket connections (`ws://`) to listen for updates.
   - Upon receiving a message, notifications are updated without a page refresh.

4. **Error Handling**:
   - Connection errors are handled gracefully to attempt reconnections if the WebSocket connection fails.
   - Security considerations, such as user authentication tokens, are applied to secure WebSocket channels.

---

### `FOLLOW_SYSTEM.md`

```markdown
# Follow System

The Follow system allows users to connect by following each other. This document describes the structure, API endpoints, and interactions for following/unfollowing users.

## Overview

### Models

- **Follower Model**:
  - The Follower model is a self-referential relationship within the `User` model.
  - It tracks the `followerId` and `followingId` pairs to represent follower relationships.

### API Routes

1. **Follow a User**:
   - Route: `/api/users/:id/follow`
   - Method: `POST`
   - Adds a record in the `Follower` model to represent a follow action.
   - Uses `authMiddleware` to ensure the user is authenticated.

2. **Unfollow a User**:
   - Route: `/api/users/:id/unfollow`
   - Method: `DELETE`
   - Removes a follower relationship from the `Follower` model.

3. **Fetch Followers and Following**:
   - Routes: `/api/users/:id/followers` and `/api/users/:id/following`
   - Method: `GET`
   - Retrieves lists of followers and following users.

### Frontend Components

- **FollowButton**:
  - A dynamic button component that toggles between "Follow" and "Unfollow" based on the user's current relationship status.
- **FollowersFollowing Page**:
  - Displays lists of followers and following users, allowing users to navigate social connections.

---

### `CRYPTO_TRANSACTIONS.md`

```markdown
# Crypto Transactions

This feature allows users to conduct transactions, including sending tips in crypto, viewing their wallet balances, and managing transaction history.

## Overview

1. **Wallet Model**
   - Stores the wallet address, user ID, and balance information for each user.
   - Transactions are associated with wallets, allowing users to view their crypto balances and recent transactions.

2. **API Endpoints**

   - **View Wallet Balance**:
     - Endpoint: `/api/wallet/:userId`
     - Method: `GET`
     - Fetches the balance and recent transactions of a user’s wallet.

   - **Send Crypto Tip**:
     - Endpoint: `/api/messages`
     - Method: `POST`
     - An optional `cryptoTip` parameter in the request body allows users to send tips along with messages.
     - The `Wallet` model is updated with each transaction.

3. **Error Handling**

   - Ensures valid wallet addresses, prevents negative balances, and validates transaction amounts.

## Security

Transaction requests are authenticated, and double-entry logging prevents duplicate transactions and ensures data consistency.

---

### `DASHBOARD.md`

```markdown
# User Dashboard

The Dashboard provides a centralized view of user-specific data, including recent activities, crypto wallet balance, and personalized feed.

## Features

1. **Feed**:
   - Displays a list of recent posts by the user and followed users.
   - Users can interact with posts directly from the dashboard.

2. **Notifications**:
   - Displays notifications for activities like new followers, likes, and comments.
   - Provides quick access to view unread notifications.

3. **Crypto Wallet Summary**:
   - Shows the current balance and recent transactions in the user's crypto wallet.
   - Integrates with the crypto trading system to display real-time data.

4. **Direct Messaging**:
   - Shows previews of recent messages and allows quick access to the messaging system.

## Components

- **NotificationBell**: Displays a count of unread notifications.
- **CryptoTicker**: Shows live updates of Solana ecosystem coins.
- **FollowButton**: Allows users to follow/unfollow directly from the dashboard.

---

These additional `.md` files document each feature comprehensively, covering the underlying logic, API interactions, and key components. These docs should make it easier for developers to maintain, extend, and understand each feature in isolation or as part of the entire application.
