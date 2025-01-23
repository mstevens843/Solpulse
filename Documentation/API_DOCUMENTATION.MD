# API Documentation

## Messages API

### `POST /api/messages`
- **Description**: Sends a new direct message.
- **Parameters**:
  - `recipient`: Username of the recipient (string, required)
  - `message`: Content of the message (string, required)
  - `cryptoTip`: Optional tip amount in SOL (float, optional)
- **Response**:
  - `200 OK`: `{ id, recipient, message, cryptoTip, timestamp }`
  - `400 Bad Request`: `{ error: "Invalid parameters" }`

### `GET /api/messages`
- **Description**: Fetches the list of messages for the authenticated user.
- **Response**:
  - `200 OK`: Array of messages in the format `{ id, sender, recipient, message, cryptoTip, timestamp }`
  - `401 Unauthorized`: `{ error: "Authentication required" }`

---

## Notifications API

### `GET /api/notifications`
- **Description**: Retrieves the user’s notifications, such as new followers, comments, likes, and transactions.
- **Response**:
  - `200 OK`: Array of notification objects `{ id, type, message, actor, timestamp }`

---

## Posts API

### `POST /api/posts`
- **Description**: Creates a new post with optional media and crypto tags.
- **Parameters**:
  - `content`: Text content of the post (string, required)
  - `media`: Media file attached to the post (file, optional)
  - `cryptoTag`: Cryptocurrency tag related to the post (string, optional)
- **Response**:
  - `201 Created`: `{ id, content, mediaUrl, cryptoTag, timestamp }`

### `GET /api/posts`
- **Description**: Fetches all posts with pagination.
- **Parameters**:
  - `page`: Page number (integer, optional)
  - `limit`: Number of posts per page (integer, optional)
- **Response**:
  - `200 OK`: `{ posts: [{ id, content, createdAt }], totalPages, currentPage }`

---

## User Settings API

### `PUT /api/users/settings`
- **Description**: Updates user account settings, such as email, password, privacy, and wallet address.
- **Parameters**:
  - `email`: User’s email address (string, optional)
  - `password`: New password for the account (string, optional)
  - `privacy`: Account privacy setting, either "public" or "private" (string, optional)
  - `walletAddress`: User’s linked crypto wallet address (string, optional)
- **Response**:
  - `200 OK`: `{ id, email, privacy, walletAddress }`
  - `400 Bad Request`: `{ error: "Invalid parameters" }`
