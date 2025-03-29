
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

    curl -X POST          -H "Content-Type: application/json"          -d '{"username": "testuser", "email": "test@example.com", "password":"password123"}'          http://localhost:3000/auth/register

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
      }
    }

**Example**:

    curl -X POST          -H "Content-Type: application/json"          -d '{"identifier": "test@example.com", "password":"password123"}'          http://localhost:3000/auth/login

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

    curl -X GET          -H "Authorization: Bearer YOUR_JWT_TOKEN"          http://localhost:3000/auth/me

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

    curl -X POST          -H "Content-Type: application/json"          -d '{"email": "test@example.com"}'          http://localhost:3000/auth/delete

---

## Middlewares

### Auth Middleware (`authMiddleware.js`)

Validates the JWT and attaches the decoded user info to `req.user`. Returns 401 if missing or invalid.

### Check Comment Ownership (`checkCommentOwnership.js`)

Checks whether the user making the request owns the comment.

### Check Ownership (`checkOwnership.js`)

Generic middleware that checks ownership for posts or comments dynamically.

---

## Utility Helpers

### Token Helpers (`token.js`)

- `generateToken(payload, expiresIn)`
- `verifyToken(token)`
- `decodeToken(token)`
- `validateToken(req)`

### Validate Token (`validateToken.js`)

Simplified helper to extract and verify token directly from `req.headers.authorization`.

---

## Example Usage

```js
router.delete('/comments/:id',
  authMiddleware,
  checkCommentOwnership,
  async (req, res) => {
    await req.comment.destroy();
    res.json({ message: 'Comment deleted' });
  });
```

---

## Error Handling

- `401`: Missing token
- `403`: Invalid token or ownership failure

---

## Additional Notes

- Tokens expire in **2 hours** (adjustable).
- Secure the frontend using **HTTP-only cookies**.
- Blacklist JWTs for advanced logout handling.
