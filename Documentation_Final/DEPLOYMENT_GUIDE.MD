# Deployment Guide

This guide walks you through deploying both the **Node.js/Express** back end and the **React** front end into a production environment. It assumes you’ve already set up your environment variables and Postgres database. Follow the steps below, and customize them as needed for your hosting platform (Heroku, AWS, DigitalOcean, etc.).

---

## Table of Contents

1. [Overview](#overview)  
2. [Prerequisites](#prerequisites)  
3. [Environment Variables](#environment-variables)  
4. [Back-End Deployment](#back-end-deployment)  
   - [Installing Dependencies](#installing-dependencies)  
   - [Database Setup](#database-setup)  
   - [Build & Start](#build--start)  
5. [Front-End Deployment](#front-end-deployment)  
   - [Installing Dependencies](#installing-dependencies-1)  
   - [Build & Serve](#build--serve)  
6. [Production Best Practices](#production-best-practices)  
7. [Additional Notes](#additional-notes)

---

## Overview

- **Back End**: Node.js/Express server with Sequelize/Postgres for database management and JWT authentication.  
- **Front End**: React application that interacts with the back end via Axios.  
- **Environment**: Two `.env` files (one for the back end, one for the front end) contain critical environment variables like DB credentials, API endpoints, and Solana config.

**Goal**: Get both parts running in production mode, with appropriate environment variables and hosting configurations.

---

## Prerequisites

1. **Node.js & npm**: Make sure you have an up-to-date version.  
2. **PostgreSQL**: A running Postgres instance (local or remote).  
3. **Host/Server**: A platform to run Node.js (e.g., Heroku, AWS EC2, DigitalOcean droplet, or on-prem server).  
4. **(Optional) Reverse Proxy**: Nginx or Apache can handle SSL termination and proxy pass to Node.js.

---

## Environment Variables

### Back-End (`.env`)

An example `.env` for the **server** might include (all in one file, no quotes):

    DB_USERNAME=cryptouser
    DB_PASSWORD=cryptokarma1
    DB_NAME=solrise_db
    DB_HOST=localhost

    JWT_SECRET=0c7joqDCKfSMrxC6IaTrXPtqH6/ifgZ1JL3hC7x2lP8=

    API_BASE_URL=http://localhost:5001/api
    WEBSOCKET_URL=ws://localhost:5001

    SOLANA_NETWORK=mainnet-beta
    SOLANA_RPC_ENDPOINT=https://solana-mainnet.g.alchemy.com/v2/dhWoE-s3HVNfalBWpWnzRIWfyJIqTamF

    APP_NAME=SolPulse
    APP_VERSION=1.0.0

    CORS_ORIGIN=http://localhost:3000
    NODE_ENV=production
    PORT=5001

> **Important**: In production, do **not** commit your `.env` to version control. Store them securely (e.g., environment variables in Heroku, AWS Secrets Manager, or Docker secrets).

### Front-End (`.env`)

An example `.env` for the **client** might include:

    SKIP_PREFLIGHT_CHECK=true

    VITE_SOLANA_NETWORK=mainnet-beta
    VITE_SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com

    VITE_API_BASE_URL=http://localhost:5001/api
    VITE_WEBSOCKET_URL=ws://localhost:5001

    VITE_GOOGLE_ANALYTICS_ID=your-google-analytics-id
    VITE_CRYPTO_API_KEY=your-crypto-api-key

    CYPRESS_API_BASE_URL=http://localhost:5001
    CYPRESS_WEBSOCKET_URL=ws://localhost:5001

> **Note**: Front-end variables are typically prefixed with `VITE_` so Vite can inject them at build time.

---

## Back-End Deployment

### Installing Dependencies

1. Navigate to your server directory (where `package.json` resides).  
2. Install all dependencies:

    npm install

3. Verify your `.env` is set up correctly (database credentials, `JWT_SECRET`, etc.).

### Database Setup

1. Create the Postgres database manually or ensure your hosting environment provides one.  
2. Configure `DB_USERNAME`, `DB_PASSWORD`, `DB_HOST`, and `DB_NAME` in your `.env`.  
3. Run migrations (if needed). For example:

    npx sequelize-cli db:migrate

   Make sure your Sequelize config points to the correct environment.

### Build & Start

1. Start the production server:

    npm run start

   This runs `node server.js` in production mode. Ensure `NODE_ENV=production` in your `.env`.

2. Check logs to confirm the server is listening on your designated `PORT` (default `5001`).

3. Optional: Use a process manager like PM2 to keep the server alive:

    npm install -g pm2
    pm2 start server.js --name "solrise-backend"

---

## Front-End Deployment

### Installing Dependencies

1. Navigate to your React app folder (where the front-end `package.json` resides).  
2. Install dependencies:

    npm install

3. Confirm `.env` is set for production usage (e.g., `VITE_API_BASE_URL` pointing to your back-end’s production URL).

### Build & Serve

1. Build the React app:

    npm run build

   This outputs a production-optimized bundle (usually the `dist` folder in Vite).

2. Deploy the output:  
   - **Option A**: Deploy to a static host like Netlify, Vercel, or GitHub Pages.  
   - **Option B**: Serve on your own server (e.g., copying `dist` into your Express static folder or using Nginx).  

3. Verify that the front end calls the correct `VITE_API_BASE_URL` to reach the back end.

---

## Production Best Practices

1. **HTTPS**: Use SSL certificates (e.g., Let’s Encrypt) to encrypt traffic.  
2. **Reverse Proxy**: Many people run Node.js behind Nginx or Apache for load balancing and SSL termination.  
3. **Security**:  
   - Hide secrets in environment variables, not in code.  
   - Ensure `NODE_ENV=production` for optimized performance.  
   - Use rate-limiting, request sanitization, and secure headers (`helmet`).  
4. **Monitoring & Logging**: Use PM2 logs or tools like Datadog for performance/error tracking.  
5. **Scaling**: If expecting heavy traffic, consider horizontal scaling or container orchestration (Docker, Kubernetes).

---

## Additional Notes

- **Database Credentials**: Make sure the production DB is accessible from your server. If using a remote DB, configure security groups/firewalls properly.  
- **Environment Variables**: Use your hosting environment’s variable manager (e.g., Heroku config vars, Docker secrets).  
- **Front-End Routing**: If using React Router, ensure your hosting serves `index.html` for unrecognized paths.  
- **Testing**: Run tests on both front end and back end before deploying:

      npm run test

Done! By following these steps—installing dependencies, configuring `.env` files, and building for production—you can deploy your app. Adjust as necessary for specific hosting providers or container-based workflows.
