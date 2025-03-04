# Authentication Guide

This document provides an overview of how authentication is implemented in this API, including details on JWT-based authentication, user registration, login, logout, protected routes, and ownership checks.

---
## Table of Contents

1. [Overview](#overview)  
2. [Environment Variables](#environment-variables)  
3. [Authentication Flow](#authentication-flow)  
4. [Auth Routes](#auth-routes)  
   - [Register (POST `/auth/register`)](#register-post-authregister)  
   - [Login (POST `/auth/login`)](#login-post-authlogin)  
   - [Logout (POST `/auth/logout`)](#logout-post-authlogout)  
   - [Get Current User (GET `/auth/me`)](#get-current-user-get-authme)  
   - [Delete User (Testing Only) (POST `/auth/delete`)](#delete-user-testing-only-post-authdelete)  
5. [Middlewares](#middlewares)  
   - [Auth Middleware (`authMiddleware.js`)](#auth-middleware-authmiddlewarejs)  
   - [Check Comment Ownership (`checkCommentOwnership.js`)](#check-comment-ownership-checkcommentownershipjs)  
   - [Check Ownership (`checkOwnership.js`)](#check-ownership-checkownershipjs)  
6. [Utility Helpers](#utility-helpers)  
   - [Token Helpers (`token.js`)](#token-helpers-tokenjs)  
   - [Validate Token (`validateToken.js`)](#validate-token-validatetokenjs)  
7. [Example Usage](#example-usage)  
8. [Error Handling](#error-handling)  
9. [Additional Notes](#additional-notes)

---

## Overview

Authentication in this project is handled via **JSON Web Tokens (JWT)**. When a user successfully logs in or registers, the server generates a JWT which the client must include in the `Authorization` header (or in an `x-auth-token` header) in subsequent requests to access protected routes.

---

## Environment Variables

1. **`JWT_SECRET`**: The secret key used to sign the JWTs.  
2. **`NODE_ENV`**: Environment mode (e.g., `development`, `production`). Used to restrict certain routes (like `/auth/delete` in production).

Make sure these variables are set in your environment (e.g., in a `.env` file) before starting the server.

---

## Authentication Flow

1. **User Registration**: Create a new user with an email, username, and password. A JWT is returned.  
2. **User Login**: Authenticates a user based on email or username plus password. Returns a JWT and user info.  
3. **Token Validation**: Protected routes verify the presence and validity of the JWT.  
4. **Logout**: Clears the token from the client (or cookies, depending on your front-end implementation).

---

## Auth Routes

All authentication routes are defined in **`routes/auth.js`**.

### Register (POST `/auth/register`)

**Description**: Creates a new user account and returns a JWT.

**Request Body**:

    {
      "username": "string (required)",
      "email": "string (required, valid email)",
      "password": "string (required, at least 6 chars)",
      "walletAddress": "string (optional)"
    }

**Response**:

    {
      "token": "JWT_STRING"
    }

**Example**:

    curl -X POST \
         -H "Content-Type: application/json" \
         -d '{"username": "testuser", "email": "test@example.com", "password":"password123"}' \
         http://localhost:3000/auth/register

---

### Login (POST `/auth/login`)

**Description**: Authenticates a user by `email` or `username` plus `password`. Returns a JWT and user info.

**Request Body**:

    {
      "identifier": "string (email or username)",
      "password": "string"
    }

**Response**:

    {
      "token": "JWT_STRING",
      "user": {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com"
        // ... other user fields
      }
    }

**Example**:

    curl -X POST \
         -H "Content-Type: application/json" \
         -d '{"identifier": "test@example.com", "password":"password123"}' \
         http://localhost:3000/auth/login

---

### Logout (POST `/auth/logout`)

**Description**: Logs out a user by clearing the auth cookie/token on the client side (server just responds with a success message).

**Response**:

    {
      "message": "Logged out successfully"
    }

**Example**:

    curl -X POST http://localhost:3000/auth/logout

---

### Get Current User (GET `/auth/me`)

**Description**: Retrieves the current user profile based on the JWT.

**Headers**:

    Authorization: Bearer <token>
    OR x-auth-token: <token>

**Response**:

    {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com"
    }

**Example**:

    curl -X GET \
         -H "Authorization: Bearer YOUR_JWT_TOKEN" \
         http://localhost:3000/auth/me

---

### Delete User (Testing Only) (POST `/auth/delete`)

> **Note**: This route is **disabled** in production. It’s only for testing or development.

**Description**: Deletes a user by their email.

**Request Body**:

    {
      "email": "user@example.com"
    }

**Response**:

    {
      "message": "User deleted successfully"
    }

**Example**:

    curl -X POST \
         -H "Content-Type: application/json" \
         -d '{"email": "test@example.com"}' \
         http://localhost:3000/auth/delete

---

## Middlewares

### Auth Middleware (`authMiddleware.js`)

- **Location**: `middleware/auth.js`  
- **Purpose**: Validates the JWT and attaches the decoded user info to `req.user`. If the token is missing or invalid, responds with an error.

**How It Works**:

1. Looks for the token in the `Authorization` header (format: `Bearer <token>`) or in `x-auth-token`.  
2. Uses the `validateToken` function to verify the JWT.  
3. Attaches the decoded data (`id`, `username`) to `req.user`.  
4. Proceeds to the next middleware or returns an error if invalid.

**Example Usage**:

    // In some route file
    router.get("/protected-route", authMiddleware, (req, res) => {
      // Access req.user for user details
      res.json({ message: "You have access", user: req.user });
    });

---

### Check Comment Ownership (`checkCommentOwnership.js`)

- **Location**: `middleware/checkCommentOwnership.js`  
- **Purpose**: Ensures the user making the request owns the comment they’re trying to modify/delete.

**How It Works**:

1. Finds the comment by its `id` from `req.params`.  
2. Compares the comment’s `userId` with `req.user.id`.  
3. If they don’t match, returns a `403` error. Otherwise, attaches the comment to `req.comment` and calls `next()`.

---

### Check Ownership (`checkOwnership.js`)

- **Location**: `middleware/checkOwnership.js`  
- **Purpose**: A more generalized ownership check for both Posts and Comments.

**How It Works**:

1. Checks the URL pattern to see if it’s for `/comments` or `/posts`.  
2. Finds the record (Comment or Post) by its `id`.  
3. Compares the record’s `userId` with `req.user.id`.  
4. Returns `403` if unauthorized, or attaches the record to `req.comment`/`req.post` and calls `next()`.

---

## Utility Helpers

### Token Helpers (`token.js`)

- **Location**: `utils/token.js`
- **Exports**:
  1. **`generateToken(payload, expiresIn)`**: Generates a signed JWT. (Default expiration: `"500000h"`)  
  2. **`verifyToken(token)`**: Verifies the JWT and returns the decoded payload or throws an error if invalid.  
  3. **`decodeToken(token)`**: Decodes a JWT without verifying.  
  4. **`validateToken(req)`**: A helper function that reads the token from the `Authorization` header and verifies it.

> **Important**: `generateToken` and `validateToken` rely on `process.env.JWT_SECRET`. Make sure it is set.

---

### Validate Token (`validateToken.js`)

- **Location**: `utils/validateToken.js`
- **Purpose**: A simplified helper that extracts the token from `req.headers.authorization`, splits out the `Bearer`, and calls `jwt.verify()`.

**Usage**:

    const validateToken = require('../utils/validateToken');

    router.get('/protected', (req, res, next) => {
      try {
        const decoded = validateToken(req);
        // do something with decoded data
        res.json({ userId: decoded.id, username: decoded.username });
      } catch (err) {
        next(err);
      }
    });

---

## Example Usage

Below is a quick example of how you might protect a route using `authMiddleware` and also check resource ownership:

    const express = require('express');
    const router = express.Router();
    const authMiddleware = require('../middleware/authMiddleware');
    const checkCommentOwnership = require('../middleware/checkCommentOwnership');

    router.delete('/comments/:id', authMiddleware, checkCommentOwnership, async (req, res) => {
      try {
        // If ownership check passes, the comment is attached to req.comment
        await req.comment.destroy();
        res.status(200).json({ message: 'Comment deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Server error' });
      }
    });

    module.exports = router;

1. **Client sends**: `DELETE /comments/123` with `Authorization: Bearer <JWT_TOKEN>`.  
2. **Middleware checks**:  
   - Is the token valid?  
   - Does `req.user.id` match the `userId` on the comment with `id=123`?  
3. **If authorized**, the comment is deleted. Otherwise, a `403 Forbidden` or `401 Unauthorized` error is returned.

---

## Error Handling

Common authentication errors include:

1. **Missing Token**: Returns `401` with `{"error": "Authorization token missing"}`.  
2. **Invalid Token**: Returns `403` with `{"error": "Invalid token"}`.  
3. **Token Expired**: Typically returns `403` with `{"error": "Token has expired"}`.  
4. **No Access (ownership checks)**: Returns `403` with `{"error": "You are not authorized to perform this action"}`.

---

## Additional Notes

**Token Expiration**:  
- In `auth.js`, tokens are set to expire in **2 hours** for registration/login.  
- In `token.js`, the default is `"500000h"` for `generateToken`.  
  Make sure to unify or adjust these to your requirements.

**Logout**:  
- Actual token invalidation requires client-side removal or server-side blacklisting.  
- The provided `/auth/logout` route simply clears the token cookie in the response.

**Production Considerations**:  
- Use **HTTPS** so tokens are not exposed in plain text.  
- Avoid providing the `/auth/delete` route in production.

**Ownership Checks**:  
- Any route that modifies or deletes user-created content should have an ownership check.  
  This is essential to prevent unauthorized changes.
