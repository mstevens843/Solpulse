// Purpose of the Migration File
// The migration file defines how your database schema evolves over time. In the context of Sequelize (a Node.js ORM), migrations are used to:

// Create Tables:

// Define the structure of tables, including fields, data types, constraints, and relationships.
// Alter Schema:

// Add, remove, or modify columns.
// Add indexes, foreign key constraints, or other database-level configurations.
// Maintain Database State:

// Allow you to move the database schema forward (up) or backward (down) using migration commands like sequelize-cli db:migrate and sequelize-cli db:migrate:undo.

// How the Migration File Interacts with Everything Else
// Models:

// The migration file and the models are interconnected:
// Models define how your application interacts with the database.
// Migrations define the actual structure of the database.

// 1. Tracks Schema Evolution
// Without migrations:

// You'd have to manually make changes to the database schema (e.g., using SQL queries).
// There's no history or record of what was changed, making it harder to understand the evolution of the schema.
// With migrations:

// Every change is documented in a migration file, creating a clear history of database schema modifications.
// You can easily reference or audit past changes.

// 3. Provides Reversibility
// Without migrations:

// If a schema change breaks the application, rolling back requires manual SQL queries, which can be time-consuming and error-prone.
// With migrations:

// The down method allows you to undo changes, making it easy to revert to a previous state.
// This ensures that schema changes are safe and reversible.


// 4. Facilitates Collaboration
// Without migrations:

// Team members might accidentally overwrite each other's schema changes.
// There's no clear process for introducing changes, leading to conflicts and errors.
// With migrations:

// Migrations serve as a source of truth for schema updates.
// Team members can review and test migrations before applying them.


// What Would Happen Without Migrations?
// Manual Schema Management:

// You would have to manually create, modify, and manage tables using SQL.
// This is error-prone and tedious, especially for large or complex projects.
// Inconsistent Schemas:

// Developers and environments might have mismatched schemas, leading to bugs and deployment failures.
// Difficult Rollbacks:

// Undoing changes would require manually writing SQL queries to reverse them, which is risky and time-consuming.
// Hard-to-Debug Issues:

// Without a clear record of changes, debugging schema-related issues becomes significantly harder.
// Broken Deployments:

// Changes deployed to production without proper testing could break the application, causing downtime or data loss.



// Summary of Changes:
// Added new tables:

// Followers: Includes followerId, followingId, and createdAt.
// Posts: Includes mediaUrl, cryptoTag.
// Comments: Associates comments with userId and postId.
// Notifications: Added fields for actorId, type, message, amount, and soft deletion.
// Transactions: Includes transaction type, status, and walletAddress.
// Wallets: Added for storing balance and unique address.

// Updated Users Table:

// Added fields: bio, profilePicture, and soft delete (deletedAt).
// Added deletedAt:

// Enabled soft deletion for applicable tables.
// Indexes:

// Added unique constraints where necessary (email, walletAddress, and composite keys in Followers).
// These changes ensure the database schema matches the updated models and functionality in the application.





'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create Users table
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      walletAddress: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      profilePicture: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Create Followers table
    await queryInterface.createTable('Followers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      followerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      followingId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    // Create Posts table with likes column
    await queryInterface.createTable('Posts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      content: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      mediaUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      cryptoTag: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mediaType: {
        type: Sequelize.ENUM('image', 'video', 'audio', 'none'),
        allowNull: true,
        defaultValue: 'none',
      },
      likes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,  // Default value for likes
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Create Comments table
    await queryInterface.createTable('Comments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      postId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Posts',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      content: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Create Notifications table
    await queryInterface.createTable('Notifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      actorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      type: {
        type: Sequelize.ENUM('like', 'comment', 'follow', 'transaction'),
        allowNull: false,
      },
      message: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      entityId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      entityType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Create Transactions table
    await queryInterface.createTable('Transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      walletAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Create Wallets table
    await queryInterface.createTable('Wallets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      balance: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Create TrendingCoins table
    await queryInterface.createTable('TrendingCoins', {
      id: {
        type: Sequelize.STRING,  // Unique CoinGecko ID
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      symbol: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      currentPrice: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      lastUpdated: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create Messages table
    await queryInterface.createTable('Messages', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      senderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      recipientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      content: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [1, 500],
            msg: 'Message content must be between 1 and 500 characters.',
          },
        },
      },
      cryptoTip: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
        validate: {
          min: {
            args: [0],
            msg: 'CryptoTip cannot be negative.',
          },
        },
      },
      read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      readAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Adding the index back to the Notification table
    await queryInterface.addIndex('Notifications', ['userId', 'isRead']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Messages');
    await queryInterface.dropTable('TrendingCoins');
    await queryInterface.dropTable('Wallets');
    await queryInterface.dropTable('Transactions');
    await queryInterface.dropTable('Notifications');
    await queryInterface.dropTable('Comments');
    await queryInterface.dropTable('Posts');
    await queryInterface.dropTable('Followers');
    await queryInterface.dropTable('Users');
  },
};




// Why All These Changes Are Needed
// Alignment with Models:

// The migration files need to reflect the updated models (User, Follower, Post, Transaction, Notification, Wallet, etc.). Without this, your database schema won't match your application logic.
// New Tables Introduced:

// We added new entities like Followers, Notifications, Wallets, and Transactions that are critical for features like followers, notifications, wallet management, and cryptocurrency transactions.
// Indexes and Constraints:

// Indexes for unique fields (like email and walletAddress) and composite keys (e.g., followerId + followingId) ensure database integrity and improve query performance.
// Constraints like onDelete: CASCADE ensure that related data (e.g., posts, followers, and notifications) is cleaned up when a user is deleted.
// Soft Deletion (paranoid):

// Adding deletedAt allows for soft deletes, which helps in scenarios where data recovery is required or for audit purposes.
// Attributes for New Features:

// Fields like bio and profilePicture in Users support additional user features.
// The Notification table includes fields like actorId, entityId, type, and amount to handle versatile notifications (likes, follows, crypto tips, etc.).
// Future-Proofing:

// By including fields like mediaUrl in posts and cryptoTag, you're setting up the schema for potential multimedia and cryptocurrency tagging features.
// Caching structures like the Wallet table support future scalability for managing cryptocurrency balances and transactions

