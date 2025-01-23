# Database Schema

## Users
- **Fields**:
  - `id`: Integer, primary key, autoincrement
  - `username`: String, unique, not null
  - `email`: String, unique, not null
  - `password`: String, hashed, not null
  - `walletAddress`: String, optional wallet address linked to the user
  - `privacy`: String, default is "public"

## Posts
- **Fields**:
  - `id`: Integer, primary key, autoincrement
  - `userId`: Integer, foreign key referencing Users.id
  - `content`: Text, not null
  - `cryptoTag`: String, optional cryptocurrency tag
  - `mediaUrl`: URL for uploaded media (string, optional)
  - `createdAt`: Timestamp, automatically set to current time

## Messages
- **Fields**:
  - `id`: Integer, primary key, autoincrement
  - `senderId`: Integer, foreign key referencing Users.id
  - `recipientId`: Integer, foreign key referencing Users.id
  - `content`: Text, not null
  - `cryptoTip`: Float, optional amount tipped in SOL
  - `createdAt`: Timestamp, automatically set to current time

## Notifications
- **Fields**:
  - `id`: Integer, primary key, autoincrement
  - `userId`: Integer, foreign key referencing Users.id
  - `type`: String, e.g., "like", "comment", "follow", "transaction"
  - `message`: Text, description of the notification
  - `actor`: Username of the user who triggered the notification
  - `createdAt`: Timestamp, automatically set to current time

## Relationships
- `User` has many `Posts`, `Messages`, and `Notifications`
- `Post` has many `Comments`
- `User` can follow other `Users` through a `Followers` join table
