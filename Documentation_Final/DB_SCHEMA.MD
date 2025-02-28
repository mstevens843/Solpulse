# Database Schema

### **Users Table** 
Stores user account information. 


| Column            | Type              | Constraints                                                   |
|-----------------  |-------------------|---------------------------------------------------------------|
| `id`              | INTEGER           | PRIMARY KEY, AUTO_INCREMENT                                   |
| `username`        | STRING(30)        | UNIQUE. NOT NULL, must be between 3-30 chars                  |
| `email`           | STRING(100)       | UNIQUE, NOT NULL, must be valid email                         |
| password          | STRING(128)       | NOT NULL, must be hashed                                      |
| walletAddress     | STRING(44)        |  UNIQUE, NOT NULL, must match Solana address format           | 
| bio               | Text              | Nullable, max length: 500 characters                          |
| profilePicture    | STRING            | NULLABLE                                                      |
| createdAt         | TIMESTAMP         | NOT NULL, DEFAULT: CURRENT_TIMESTAMP                          |
| updatedAt         | TIMESTAMP         | NOT NULL, DEFAULT: CURRENT_TIMESTAMP                          |            
| deletedAt         | TIMESTAMP         | NULLABLE (soft delete)                                        | 


### **Relationships**
- **1-to-Many**: `User` -> `Posts`
- **1-to-Many**: `User` -> `Comments`
- **1-to-Many**: `User` -> `Followers` (as `following` and `followers`)
- **1-to-Many**: `User` -> `Notifications`
- **1-to-Many**: `User` -> `Transactions`
- **1-to-many**: `User` -> `Notifications`
- **1-to-Many**: `User` -> `Wallets`
- **Many-to-Many**: `User` ** `Posts` (`Like` join table)
- **Many-to-Many**: `User` ** `Posts` (`Retweet` join table) 




### **Followers Table**
Stores relationships between users who follow each other. 

| Column            | Type              | Constraints                                                   |
|-----------------  |-------------------|---------------------------------------------------------------|
| `id`              | INTEGER           | PRIMARY KEY, AUTO_INCREMENT                                   |
| followerId        | INTEGER           | FOREIGN KEY (`Users.id`), NOT NULL, ON DELETE CASCADE         |
| followingId       | INTEGER           | FOREIGN KEY (`Users.id`), NOT NULL, ON DELETE CASCADE         |
| createdAt         | TIMESTAMP         | NOT NULL, DEFAULT: CURRENT_TIMESTAMP                          |
| updatedAt         | TIMESTAMP         | NOT NULL, DEFAULT: CURRENT_TIMESTAMP                          |

#### **Relationships**
- **Many-to-Many (Self-Referencing)**: Users can follow each other. 
- **Cascade on Delete**: If a user is deleted, their follow/unfollow records are also. 
- **Unique Constraint**: A user cannot follow the same person more than once. 




### **Posts Table*** 
Stores user-generated posts. 
| Column            | Type              | Constraints                                                   |
|-----------------  |-------------------|---------------------------------------------------------------|
| `id`              | INTEGER           | PRIMARY KEY, AUTO_INCREMENT                                   |
| userId            | INTEGER           | FOREIGN KEY (`Users.id`), NOT NULL, ON DELETE CASCADE         |
| content           | STRING(280)       | NOT NULL, must be between 1-280 characters                    |
| mediaUrl          | STRING            | NULLABLE, must be a valid URL if provided                     |
| mediaType         | ENUM              | NULLABLE, allowed values: `image`, `video`,                   |
| cryptoTag         | STRING            | NULLABLE, must be alphanumeric                                |
| likes             | INTEGER           | NOT NULL, DEFAULT: 0                                          |
| retweets          | INTEGER           | NOT NULL, DEFAULT: 0                                          |
| isRetweet         | BOOLEAN           | NOT NULL, DEFAULT: false                                      |
| originalPostId    | INTEGER           | FOREIGN KEY (`Posts.id`), NULLABLE, ON DELETE SET NULL        |
| originalUserId    | INTEGER           | FOREIGN KEY (`Users.id`), NULLABLE, ON DELETE SET NULL        |
| originalAuthor    | STRING            | NULLABLE, stores original author's username                   |
| originalProfilePicture | STRING       | NULLABLE, stores original author's profile picture            |
| createdAt         | TIMESTAMP         | NOT NULL, DEFAULT: CURRENT_TIMESTAMP                          |
| updatedAt         | TIMESTAMP         | NOT NULL, DEFAULT: CURRENT_TIMESTAMP                          |
| deletedAt         | TIMESTAMP         | NULLABLE (soft delete)                                        |


#### **Relationships** 
- **1-to-Many**: `User` -> `Posts`
- **1-to-Many**: `Post` -> `Comments`
- **1-to-Many**: `Post` -> `Likes`
- **1-to-Many**: `Post` -> `Retweets`
- **Many-to-Many**: `Post` ** `Users` (`Like` join table)
- **Many-to-Many**: `Post` ** `Users` (`Retweet` join table)
- **Self-Referencing**: `Post` -> `originalPostId` (For retweeets)







### **Likes Table**
Stores likes on posts.

| Column   | Type     | Constraints                                      |
|----------|---------|--------------------------------------------------|
| id       | INTEGER | PRIMARY KEY, AUTO_INCREMENT                     |
| postId   | INTEGER | FOREIGN KEY (`Posts.id`), NOT NULL, ON DELETE CASCADE |
| userId   | INTEGER | FOREIGN KEY (`Users.id`), NOT NULL, ON DELETE CASCADE |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT: CURRENT_TIMESTAMP           |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT: CURRENT_TIMESTAMP           |

####  **Relationships**
- **Many-to-1**: `Like` → `Post`
- **Many-to-1**: `Like` → `User`
- **Many-to-Many**: `User` ↔ `Posts` (through `Likes` table)
- **Cascade on Delete**: If a `Post` or `User` is deleted, associated `Likes` are also removed.







### **Comments Table**
Stores comments made on posts.

| Column   | Type     | Constraints                                      |
|----------|---------|--------------------------------------------------|
| id       | INTEGER | PRIMARY KEY, AUTO_INCREMENT                     |
| userId   | INTEGER | FOREIGN KEY (`Users.id`), NOT NULL, ON DELETE CASCADE |
| postId   | INTEGER | FOREIGN KEY (`Posts.id`), NOT NULL, ON DELETE CASCADE |
| content  | TEXT    | NOT NULL, must not be empty                      |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT: CURRENT_TIMESTAMP           |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT: CURRENT_TIMESTAMP           |

#### 🔗 **Relationships**
- **1-to-Many**: `User` → `Comments`
- **1-to-Many**: `Post` → `Comments`
- **Cascade on Delete**: If a `Post` or `User` is deleted, associated `Comments` are also removed.




### **Notifications Table**
Stores notifications for user interactions.

| Column      | Type      | Constraints                                      |
|------------|----------|--------------------------------------------------|
| id         | INTEGER  | PRIMARY KEY, AUTO_INCREMENT                     |
| userId     | INTEGER  | FOREIGN KEY (`Users.id`), NOT NULL, ON DELETE CASCADE (Recipient) |
| actorId    | INTEGER  | FOREIGN KEY (`Users.id`), NOT NULL, ON DELETE CASCADE (Actor) |
| type       | ENUM     | NOT NULL, Allowed values: `like`, `comment`, `follow`, `retweet`, `transaction` |
| message    | STRING   | NULLABLE, auto-generated if not provided         |
| amount     | FLOAT    | NULLABLE, only used for `transaction` notifications |
| entityId   | STRING   | NULLABLE, stores associated entity (e.g., post, comment, transaction ID) |
| entityType | STRING   | NULLABLE, stores type of associated entity (e.g., `Post`, `Comment`) |
| isRead     | BOOLEAN  | NOT NULL, DEFAULT: false                         |
| createdAt  | TIMESTAMP | NOT NULL, DEFAULT: CURRENT_TIMESTAMP           |
| updatedAt  | TIMESTAMP | NOT NULL, DEFAULT: CURRENT_TIMESTAMP           |
| deletedAt  | TIMESTAMP | NULLABLE (soft delete)                          |

####  **Relationships**
- **1-to-Many**: `User` → `Notifications` (as recipient)
- **1-to-Many**: `User` → `Notifications` (as actor)
- **Cascade on Delete**: If a `User` is deleted, their sent and received `Notifications` are also removed.










### **Messages Table**
Stores direct messages between users.

| Column      | Type      | Constraints                                      |
|------------|----------|--------------------------------------------------|
| id         | INTEGER  | PRIMARY KEY, AUTO_INCREMENT                     |
| senderId   | INTEGER  | FOREIGN KEY (`Users.id`), NOT NULL, ON DELETE CASCADE (Sender) |
| recipientId | INTEGER | FOREIGN KEY (`Users.id`), NOT NULL, ON DELETE CASCADE (Recipient) |
| content    | STRING   | NOT NULL, must be between 1-500 characters      |
| cryptoTip  | FLOAT    | NOT NULL, DEFAULT: 0.0, must be non-negative    |
| read       | BOOLEAN  | NOT NULL, DEFAULT: false (unread by default)    |
| readAt     | TIMESTAMP | NULLABLE, set when message is read              |
| createdAt  | TIMESTAMP | NOT NULL, DEFAULT: CURRENT_TIMESTAMP           |
| updatedAt  | TIMESTAMP | NOT NULL, DEFAULT: CURRENT_TIMESTAMP           |

####  **Relationships**
- **1-to-Many**: `User` → `Messages` (as sender)
- **1-to-Many**: `User` → `Messages` (as recipient)
- **Cascade on Delete**: If a `User` is deleted, their sent and received `Messages` are also removed.





### **Tips Table**
Stores transactions where users send cryptocurrency tips to each other.

| Column      | Type      | Constraints                                      |
|------------|----------|--------------------------------------------------|
| id         | INTEGER  | PRIMARY KEY, AUTO_INCREMENT                     |
| fromUserId | INTEGER  | FOREIGN KEY (`Users.id`), NOT NULL, ON DELETE CASCADE (Sender) |
| toUserId   | INTEGER  | FOREIGN KEY (`Users.id`), NOT NULL, ON DELETE CASCADE (Recipient) |
| amount     | FLOAT    | NOT NULL, must be greater than 0                 |
| message    | STRING   | NULLABLE, max length: 255 characters             |
| createdAt  | TIMESTAMP | NOT NULL, DEFAULT: CURRENT_TIMESTAMP           |
| updatedAt  | TIMESTAMP | NOT NULL, DEFAULT: CURRENT_TIMESTAMP           |
| deletedAt  | TIMESTAMP | NULLABLE (soft delete)                          |

####  **Relationships**
- **1-to-Many**: `User` → `Tips` (as sender)
- **1-to-Many**: `User` → `Tips` (as recipient)
- **Cascade on Delete**: If a `User` is deleted, their sent and received `Tips` are also removed.






##  **Removed Tables**
- **Transactions Table**: Not used because all transactions were handled directly in **Phantom Wallet**.
- **Wallets Table**: Not used because `walletAddress` was stored directly in the **Users** table.
- **Retweets Table**: Not used because retweets were stored inside the **Posts** table (`isRetweet`, `originalPostId`).




##  **Third-Party Integrations**
While the database schema does not include third-party APIs, the application integrates:
- **[Jupiter API](https://www.jup.ag/)**: Used for **Solana swaps and on-chain transactions**.
- **[CoinGecko API](https://www.coingecko.com/)**: Used for **cryptocurrency price tracking and market data**.

These APIs are used dynamically and are **not stored in the database**.