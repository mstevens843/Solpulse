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

- **Description**: Creates a new user account and returns a JWT.  
- **Request Body**:
  ```json
  {
    "username": "string (required)",
    "email": "string (required, valid email)",
    "password": "string (required, at least 6 chars)",
    "walletAddress": "string (optional)"
  }
