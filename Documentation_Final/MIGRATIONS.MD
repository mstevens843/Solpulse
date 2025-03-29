# 📦 Database Migrations Overview

This directory contains schema migrations for the SolPulse backend. Each migration reflects meaningful database evolution aligned with feature development, performance tuning, or schema integrity.

---

## 🔢 Migrations Index (Grouped by Feature)

### 🏗️ Core Schema Initialization
| #  | Migration Name                         | Summary                    |
|----|----------------------------------------|----------------------------|
| 01 | 202-create-database-schema.js          | Initial schema setup       |

---

### 👤 Users
| #  | Migration Name                                     | Summary                                                  |
|----|----------------------------------------------------|----------------------------------------------------------|
| 28 | 20250322033000-add-settings-columns-to-users.js    | Added `privacy`, `notifications`, and `theme` enum fields|

---

### 📝 Posts
| #  | Migration Name                                              | Summary                                                             |
|----|-------------------------------------------------------------|----------------------------------------------------------------------|
| 06 | 20250109-update-cryptoTag-to-string.js                      | Made `cryptoTag` optional instead of a strict enum                  |
| 11 | 20241225022432-add-likes-and-retweets-columns-to-posts.js   | Add `likes` and `retweets` columns to `Posts`                       |
| 23 | 20250128153005-add-retweet-columns-to-posts.js              | Added `isRetweet` and `originalPostId` columns                      |
| 24 | 20250128153006-add-author-and-profile-columns-to-posts.js   | Add `originalAuthor` and `originalProfilePicture` to `Posts`       |
| 26 | 20250128153008-add-originalUserId-column-to-posts.js        | Linked reposts to original user with foreign key                    |

---

### 💬 Notifications
| #  | Migration Name                                             | Summary                                                             |
|----|------------------------------------------------------------|----------------------------------------------------------------------|
| 02 | 20241223-add-message-to-notification-type.js               | Added `message` to notifications enum                               |
| 03 | 20241224-add-mention-to-notifications-type.js              | Added `mention` to notifications enum                               |
| 04 | 20241224-add-new-enum-values-to-notifications-type.js      | Conditionally added `mention`, `share`, and `rest` enum values      |
| 05 | 20241227-fix-enum-notifications-type.js                    | Recreated `enum_Notifications_type` structure from scratch          |
| 15 | 20241225153000-add-message-to-notifications-type.js        | Down migration to revert enum structure                             |
| 19 | 20250126153001-add-retweet-to-notifications-type.js        | Add `retweet` to enum                                               |
| 25 | 20250128153007-add-tip-columns-to-notifications.js         | (Commented out) Add `amount` and `entityId` placeholders            |

---

### 💸 Transactions
| #  | Migration Name                                      | Summary                                                        |
|----|-----------------------------------------------------|-----------------------------------------------------------------|
| 09 | 20241225010000-add-referenceid-to-transactions.js   | Add optional, unique `referenceId`                             |
| 10 | 20241225020000-add-description-to-transactions.js   | Add `description` field with validation                        |
| 12 | 20241225030000-add-deletedat-to-transactions.js     | Add `deletedAt` to enable soft-deletes                         |
| 13 | 20241225040000-add-walletid-to-transactions.js      | Add `walletId` foreign key and migrate from `walletAddress`    |

---

### 👛 Wallets
| #  | Migration Name                              | Summary                          |
|----|---------------------------------------------|----------------------------------|
| 08 | 20241225000000-add-deletedat-to-wallets.js  | Enable soft-deletes on `Wallets` |

---

### 💰 Tips
| #  | Migration Name                           | Summary               |
|----|------------------------------------------|-----------------------|
| 07 | 202412240945_create-tips-table.js        | Create `Tips` table   |

---

### ❤️ Likes / 🔁 Retweets / 👥 Followers
| #  | Migration Name                                                  | Summary                                           |
|----|-----------------------------------------------------------------|--------------------------------------------------|
| 14 | 20241225135908-add-likes-and-retweets-columns-to-posts.js      | Duplicate or revision of likes/retweets column   |
| 16 | 20250126095813-20250126153002-add-like-to-notifications-type.js| Add `Likes` table (multi-version migration)       |
| 17 | 20250126122105-20250126153004-add-timestamps-to-followers.js   | Add `updatedAt` to `Followers`                   |
| 18 | 20250126122211-20250126153004-add-timestamps-to-followers.js   | Add `updatedAt` to `Followers` (alt timestamp)   |
| 20 | 20250126153002-add-like-to-notifications-type.js               | Add `Likes` table with FK to `Posts` + `Users`   |
| 21 | 20250126153003-add-retweet-to-notifications.js                 | Create `Retweets` table                          |
| 22 | 20250126153004-add-timestamps-to-followers.js                  | Final follower timestamp patch                   |

---

### 💬 Messages
| #  | Migration Name                                         | Summary                              |
|----|--------------------------------------------------------|--------------------------------------|
| 27 | 20250321014500-add-attachmentPath-column-to-messages.js| Add `attachmentPath` for file uploads|


---

## 🔍 Highlighted Migrations (Deep Dives)

### 🏗️ 00 - Initialize Core Schema

**Filename:** `20231001-initialize-core-schema.js`  
**Purpose:** Establish the initial database structure for the SolPulse backend  
**Impact:** Creates all foundational tables and relationships for the app

#### 🧱 Summary of Changes

- **Added new tables:**
  - `Users`: Includes `username`, `email`, `walletAddress`, `bio`, `profilePicture`, `deletedAt`
  - `Followers`: Tracks `followerId` and `followingId`, both referencing `Users`
  - `Posts`: Includes `mediaUrl`, `cryptoTag`, `mediaType`, `likes`, `deletedAt`
  - `Comments`: Associates `userId` and `postId` with content
  - `Notifications`: Includes `actorId`, `type`, `message`, `amount`, `entityId`, soft delete support
  - `Transactions`: Includes `userId`, `walletAddress`, `amount`, `type`, `status`
  - `Wallets`: Stores `balance`, unique `address`, and `userId`
  - `TrendingCoins`: Coin metadata from CoinGecko (e.g. `name`, `symbol`, `currentPrice`)
  - `Messages`: Includes `senderId`, `recipientId`, `content`, `cryptoTip`, `read`, `readAt`

- **Added Indexes and Constraints:**
  - Unique constraints on `email`, `username`, `walletAddress`
  - Foreign keys with `CASCADE` behavior
  - Composite key indexing on `Notifications` (`userId`, `isRead`)

### 🔧 06 - Extend Enum Notifications

**Filename:** `20231110-extend-enum-add-message.js`  
**Purpose:** Add support for in-app message notifications  
**Impact:** Expands the PostgreSQL enum `enum_Notifications_type` to include `'message'`

#### 💡 Why This Migration Was Needed

The application introduced a new feature allowing users to send **direct messages (DMs)** to one another. To track these interactions within the notification system, a new enum value, `message`, needed to be added to the existing `Notifications.type` column.

Because PostgreSQL enums are immutable and Sequelize doesn’t support altering enums natively, we used raw SQL to modify the enum type **safely and idempotently**, with full rollback support.

#### ⚙️ What Makes This Migration Unique

- ✅ Uses raw SQL with conditional logic (`IF NOT EXISTS`) to prevent duplication  
- ✅ Ensures idempotency — safe to run multiple times  
- ✅ Fully rollbackable by recreating the enum and casting values safely  
- ✅ Reflects deep knowledge of PostgreSQL internals and Sequelize limitations

#### 🔼 Excerpt from `up` Migration

```sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type typ
    JOIN pg_enum enm ON enm.enumtypid = typ.oid
    WHERE typ.typname = 'enum_Notifications_type' AND enm.enumlabel = 'message'
  ) THEN
    ALTER TYPE "enum_Notifications_type" ADD VALUE 'message';
  END IF;
END$$;
```

---

### 🔧 07 - Add `mention` Enum to Notifications

**Filename:** `20231112-add-mention-enum.js`  
**Purpose:** Introduce a `mention` notification type for @mentions in posts or comments  
**Impact:** Adds a new enum value to `enum_Notifications_type`

#### 🛠️ Notes

- PostgreSQL doesn’t support removing enum values directly  
- Down migration logs a warning and is skipped  

#### 🔼 Excerpt from `up` Migration

```sql
ALTER TYPE "enum_Notifications_type" ADD VALUE 'mention';
```

---

### 🔧 08 - Add Multiple Enum Values Conditionally

**Filename:** `20231113-add-multiple-enum-values.js`  
**Purpose:** Adds `mention`, `share`, and `rest` to the enum conditionally  
**Impact:** Extends `enum_Notifications_type` safely by checking if each value exists

#### ⚙️ What Makes This Migration Useful

- Loops through a list of new values  
- Checks if each already exists before altering enum  
- Logs what was added vs skipped  

#### 🧠 Summary Logic

```javascript
const newEnumValues = ['mention', 'share', 'rest'];
for (const value of newEnumValues) {
  if (!enumExists) {
    ALTER TYPE ... ADD VALUE ...
  }
}
```

---

### 🔧 09 - Recreate Enum for Clean Structure

**Filename:** `20231114-recreate-enum-clean-version.js`  
**Purpose:** Clean up and consolidate the enum after multiple additions  
**Impact:** Recreates the `enum_Notifications_type` with all valid values in one place

#### 🔄 Migration Strategy

1. Renames the old enum  
2. Creates a new enum with the final value set  
3. Alters the `Notifications.type` column to use the new enum  
4. Drops the old enum  

#### 🔼 Excerpt from `up` Migration

```sql
ALTER TYPE "enum_Notifications_type" RENAME TO "enum_Notifications_type_old";

CREATE TYPE "enum_Notifications_type" AS ENUM ('like', 'comment', 'follow', 'transaction', 'message');

ALTER TABLE "Notifications"
ALTER COLUMN "type"
TYPE "enum_Notifications_type"
USING "type"::text::"enum_Notifications_type";

DROP TYPE "enum_Notifications_type_old";
```

---


### 🔧 10 - Make `cryptoTag` Optional in Posts

**Filename:** `20231115-make-cryptoTag-optional.js`  
**Purpose:** Loosen restriction on the `cryptoTag` column in the `Posts` table  
**Impact:** Allows `cryptoTag` to be `NULL` instead of requiring a specific enum

#### 🔼 Excerpt from `up` Migration

```js
await queryInterface.changeColumn('Posts', 'cryptoTag', {
  type: Sequelize.STRING,
  allowNull: true,
});
```

---

### 🔧 11 - Create `Tips` Table

**Filename:** `20231118-create-tips-table.js`  
**Purpose:** Support user-to-user tipping system  
**Impact:** Adds new `Tips` table with `fromUserId`, `toUserId`, `amount`, and optional `message`

#### 🔼 Excerpt from `up` Migration

```js
await queryInterface.createTable('Tips', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  fromUserId: { type: Sequelize.INTEGER, allowNull: false },
  toUserId: { type: Sequelize.INTEGER, allowNull: false },
  amount: { type: Sequelize.FLOAT, allowNull: false },
  message: { type: Sequelize.STRING, allowNull: true },
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE,
  deletedAt: Sequelize.DATE,
});
```

---

### 🔧 12 - Add `deletedAt` to Wallets

**Filename:** `20231119-add-wallets-deletedAt.js`  
**Purpose:** Soft-delete support for `Wallets`  
**Impact:** Adds `deletedAt` column to enable Sequelize paranoid mode

---

### 🔧 13 - Add `referenceId` to Transactions

**Filename:** `20231120-add-referenceId-to-transactions.js`  
**Purpose:** Add external reference tracking for each transaction  
**Impact:** Adds a unique, optional `referenceId` string to `Transactions`

---

### 🔧 14 - Add `description` to Transactions

**Filename:** `20231121-add-description-to-transactions.js`  
**Purpose:** Add a user-provided description for each transaction  
**Impact:** Adds optional `description` with max length validation

---

### 🔧 15 - Add `retweets` Column to Posts

**Filename:** `20231122-add-retweets-to-posts.js`  
**Purpose:** Track how many times a post has been retweeted  
**Impact:** Adds `retweets` column with default value `0`

---

### 🔧 16 - Add `deletedAt` to Transactions

**Filename:** `20231123-add-deletedAt-to-transactions.js`  
**Purpose:** Enable soft-deletion of transaction records  
**Impact:** Adds nullable `deletedAt` timestamp to `Transactions`

---

### 🔧 17 - Add `walletId` ForeignKey to Transactions

**Filename:** `20231124-add-walletId-to-transactions.js`  
**Purpose:** Replace `walletAddress` with proper foreign key relationship  
**Impact:**  
- Adds nullable `walletId` column  
- Migrates data using SQL  
- Alters column to be `NOT NULL` after data is migrated

#### ⚙️ Strategy Summary

1. Add `walletId` column  
2. Update existing rows by matching wallet address  
3. Make `walletId` non-nullable and enforce FK constraints

---

### 🔧 18 - Placeholder Migration

**Filename:** `20231125-empty-migration.js`  
**Purpose:** Placeholder file — no actions taken  
**Impact:** No schema changes  



### 🔧 19 - Down Migration to Rebuild Notifications Enum

**Filename:** `20231126-rebuild-enum-down-only.js`  
**Purpose:** Support rollback of enum changes  
**Impact:** Provides logic to recreate enum with original values during rollback

#### 🔽 Excerpt from `down` Migration

```sql
CREATE TYPE "enum_Notifications_type_temp" AS ENUM('other_existing_values');
ALTER TABLE "Notifications" ALTER COLUMN "type" TYPE "enum_Notifications_type_temp" USING "type"::text::"enum_Notifications_type_temp";
DROP TYPE "enum_Notifications_type";
ALTER TYPE "enum_Notifications_type_temp" RENAME TO "enum_Notifications_type";
```

---

### 🔧 20-22 - Empty Placeholder Migrations

**Filenames:**
- `20231127-placeholder-a.js`
- `20231128-placeholder-b.js`
- `20231129-placeholder-c.js`

**Purpose:** Placeholder migration files reserved for future use  
**Impact:** No schema changes performed

---

### 🔧 23 - Add `retweet` Enum to Notifications

**Filename:** `20231130-add-retweet-enum.js`  
**Purpose:** Add new notification type for retweets  
**Impact:** Adds `retweet` to `enum_Notifications_type`

#### 🔼 Excerpt from `up` Migration

```sql
ALTER TYPE "enum_Notifications_type" ADD VALUE 'retweet';
```

#### 🔽 Excerpt from `down` Migration

```sql
CREATE TYPE "enum_Notifications_type_temp" AS ENUM('like', 'comment', 'follow', 'transaction', 'message');
ALTER TABLE "Notifications" ALTER COLUMN "type" TYPE "enum_Notifications_type_temp" USING "type"::text::"enum_Notifications_type_temp";
DROP TYPE "enum_Notifications_type";
ALTER TYPE "enum_Notifications_type_temp" RENAME TO "enum_Notifications_type";
```

---

### 🔧 24 - Create `Likes` Table

**Filename:** `20231201-create-likes-table.js`  
**Purpose:** Store post likes  
**Impact:** Adds a `Likes` table with `postId` and `userId` foreign keys

---

### 🔧 25 - Create `Retweets` Table

**Filename:** `20231202-create-retweets-table.js`  
**Purpose:** Track which users retweeted which posts  
**Impact:** Adds a `Retweets` table with foreign keys to `Posts` and `Users`

---

### 🔧 26 - Add `updatedAt` to Followers Table

**Filename:** `20231203-add-updatedAt-to-followers.js`  
**Purpose:** Improve tracking of follow activity  
**Impact:** Adds non-null `updatedAt` column with `NOW()` default to `Followers`



### 🔧 27 - Add Original Author Fields to Posts

**Filename:** `20231204-add-original-author-fields.js`  
**Purpose:** Preserve attribution on reposted content  
**Impact:** Adds `originalAuthor` and `originalProfilePicture` to `Posts`

---

### 🔧 28 - Commented-Out Notification Fields (Skipped)

**Filename:** `20231205-add-amount-and-entityId-to-notifications.js`  
**Purpose:** Placeholder for future `amount` and `entityId` columns  
**Impact:** No changes performed — all code is commented out

---

### 🔧 29 - Add `originalUserId` to Posts

**Filename:** `20231206-add-original-user-id.js`  
**Purpose:** Track the original creator of a repost  
**Impact:** Adds nullable foreign key `originalUserId` to `Posts`

---

### 🔧 30 - Add Attachments to Messages

**Filename:** `20231207-add-attachment-path-to-messages.js`  
**Purpose:** Enable file attachments in messaging  
**Impact:** Adds optional `attachmentPath` string to `Messages`

---

### 🔧 31 - Add Privacy, Notification, and Theme Settings to Users

**Filename:** `20231208-add-user-settings-enums.js`  
**Purpose:** Give users control over privacy, notifications, and theme  
**Impact:** Adds three new enum fields to `Users`:
- `privacy`: `'public' | 'private'`
- `notifications`: `'enabled' | 'disabled'`
- `theme`: `'dark' | 'light'`

#### 🧹 Down Migration Includes Manual Enum Cleanup

```sql
DROP TYPE IF EXISTS "enum_Users_privacy";
DROP TYPE IF EXISTS "enum_Users_notifications";
DROP TYPE IF EXISTS "enum_Users_theme";
```

---
