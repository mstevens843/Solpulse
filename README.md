# SolPulse — Main Project Overview

**Live App:** [Visit SolPulse](https://www.solpulse.net)

# Back-end deployment URL: 
https://solpulse.onrender.com

Welcome to **SolPulse**, a social-driven platform built on Solana that enables users to post, comment, like, and retweet crypto-related content, all while interfacing with Solana-based functionalities. This README provides a high-level overview of the project, its architecture, and how to get started. For more specific guides (authentication, API references, deployment, etc.), see the additional documentation linked below.

---

## Table of Contents

1. [Project Introduction](#project-introduction)  
2. [Features](#features)  
3. [Tech Stack](#tech-stack)  
4. [Entity Relationship Diagram (ERD)](#entity-relationship-diagram-erd)  
5. [Repository Structure](#repository-structure)  
6. [Getting Started](#getting-started)  
7. [Error Handling & Logging](#error-handling--logging)  
8. [Additional Documentation](#additional-documentation)  
9. [Contributing](#contributing)  
10. [Contact](#contact)  
11. [License](#license)  


---

## Project Introduction

**SolPulse** is designed as a Twitter-like social platform for the Solana ecosystem, enabling users to:

- Register/login with standard JWT-based authentication  
- Create and interact with posts (like, retweet, comment)  
- Fetch live crypto data from 3rd-party APIs such as CoinGecko and Jupiter  
- Integrate with the Solana network to enhance the user’s crypto experience

Ultimately, **SolPulse** aims to be a community hub for crypto enthusiasts, providing real-time data feeds, social engagement, and a secure, scalable infrastructure.

---

## Features

1. **User Authentication**  
   - Back-end auth using JWT (token-based) with secure password hashing (bcrypt)  
   - Front-end React Context for managing auth state and tokens (stored in `localStorage`)

2. **Social Actions**  
   - CRUD operations for Posts and Comments (with ownership checks)  
   - Like and Retweet functionalities, stored in Postgres  
   - Real-time notifications using Socket.IO (optional)

3. **Solana Integration**  
   - References to **Solana RPC** endpoints for mainnet operations  
   - Potential for on-chain interactions (wallet addresses, transactions, etc.)

4. **3rd-Party API Calls**  
   - CoinGecko for crypto prices/market data  
   - Jupiter for token swap/routing data  
   - Additional endpoints as needed for DeFi data and analytics

5. **Scalable Architecture**  
   - Node.js/Express back end with Sequelize for Postgres  
   - React front end with Axios interceptors for token-based requests  
   - Environment variable configurations for easy deployment in different environments (development, production)

---


## Current API Rate Limitations

**SolPulse currently utilizes free-tier access to several key APIs and services:** 
- CoinGecko API – for live cryptocurrency prices, trending coins, and market data
- Jupiter API – for token swap quotes and transaction routing on Solana
- Solana RPC (via Alchemy) – for wallet connections, transaction confirmations, and on-chain data

**These service enforce rate limits on free plans, which may be temporarily impact:
- Real-time price updates and trending feed responsiveness
- Swap failures due to Jupiter API throttling API (429 errors) 
- Wallet/token balance refresh issues during periods of high activity

--- 


## Tech Stack

- **Front End**  
  - [React](https://react.dev/) + [Vite](https://vitejs.dev/)  
  - React Context for authentication & state management  
  - [Axios](https://github.com/axios/axios) for HTTP requests  
  - Tailwind CSS (or custom CSS) for styling  

- **Back End**  
  - [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)  
  - [Sequelize](https://sequelize.org/) ORM with [Postgres](https://www.postgresql.org/)  
  - JWT-based authentication, plus [bcrypt](https://www.npmjs.com/package/bcrypt) for password hashing  
  - [Socket.IO](https://socket.io/) for real-time events (optional)

- **Database**  
  - [PostgreSQL](https://www.postgresql.org/) for storing user accounts, posts, comments, etc.

- **Other**  
  - [CoinGecko API](https://www.coingecko.com/en/api) for crypto prices/metadata  
  - [Jupiter API](https://jup.ag/) for Solana token swaps (optional)  
  - Environment-based `.env` files for secure configuration  

---


## Entity Relationship Diagram (ERD)
The following diagram represents the database structure for SolPulse, illustrating the relationships between Users, Posts, Comments, Likes, Retweets, and other key entities.

![SolPulse ERD](./Documentation_Final/solpulse-ERD.png)

---



## Repository Structure

```bash
 project-root
    server/               # Back-end (Node.js/Express)
 │      routes/             # Express routes (Auth, Posts, etc.)
 │      models/             # Sequelize models (User, Post, Comment)
 │      middleware/         # Auth & ownership middlewares
 │      utils/              # Utility functions (token helpers, etc.)
 │      server.js           # Main entry point for Express
 │      package.json
 │      .env                # Back-end environment config
    client/               # Front-end (React)
 │      src/
 │   │      api/            # Axios config, user services
 │   │      context/        # AuthContext and other contexts
 │   │      components/     # Reusable React components
 │   │      pages/          # Main pages/routes
 │   │      App.jsx
 │      public/
 │      package.json
 │      .env                # Front-end environment config
    API_DOCUMENTATION.md
    THIRD_PARTY_APIS.md
    BACKEND_AUTH_GUIDE.md
    FRONT_END_AUTH_GUIDE.md
    DEPLOYMENT.md
    PROJECT_PROPOSAL.md
     README.md               # (This file) Main overview
```



## Getting Started
1. **Clone the repository**:

- git clone https://github.com/your-username/solpulse.git
- cd solpulse

2. **Set up the environment**:
- Create and configure .env files for both server/ and client/ as needed. Refer to your Deployment Guide or the environment variable sections in the respective docs.

3. **Install dependencies**:

# Back end
- cd server
- npm install

# Front end
- cd ../client
- npm install


4. **Run in development mode**:

# Back end
- cd server
- npm run dev  # or "npm start" depending on your scripts

# Front end
- cd ../client
- npm run start
- By default, the back end listens on localhost:5001
- The front end listens on localhost:3000


5. **Access the app**:
- Open your browser to http://localhost:3000
- The front end will call the Node.js API at http://localhost:5001 (if configured as such)




## Error Handling & Logging
### Backend:
- All API responses follow a structured JSON format with specific error messages.
- Common errors include:
  - `"Invalid request parameters"` (handled via middleware validation)
  - `"Database connection failed"` (logged with timestamps)
  - `"User authentication failed"` (returns HTTP 401 Unauthorized)

### Frontend:
- **React Error Boundaries** prevent UI crashes and log unexpected errors.
- WebSocket logs **are disabled in production** to avoid clutter.




## Additional Documentation
- API Documentation (API_DOCUMENTATION.md)
- Detailed info on your API endpoints, request/response formats, etc.

# Third-Party API Documentation (THIRD_PARTY_APIS.md)
- How you integrate with CoinGecko, Jupiter, or other external services.

**Back-End Auth Guide (BACKEND_AUTH_GUIDE.md)**:
- Explains JWT generation, validation, and how routes are protected.

**Front-End Auth Guide (FRONT_END_AUTH_GUIDE.md)**:
- Shows how React manages tokens, localStorage, and Axios interceptors.

**Deployment Guide (DEPLOYMENT.md)**:
- Step-by-step instructions for deploying this project to production.

**Project Proposal (PROJECT_PROPOSAL.md)**:
- Original project idea, scope, and requirements.

## Contributing
We welcome contributions! Please follow these steps:

1. **Fork the repository**  
2. **Create a new branch** (`git checkout -b feature-new-feature`)  
3. **Commit changes** (`git commit -m "Added feature XYZ"`)  
4. **Push your branch** (`git push origin feature-new-feature`)  
5. **Submit a pull request** – We will review and merge!

For major changes, open an issue first to discuss the implementation.



## Contact
For any questions or support, feel free to reach out:

- **GitHub:** [mstevens843](https://github.com/mstevens843)  
- **Email:** [mathewstevens7457@gmail.com]


## License
This repository is **publicly viewable** but is **not open-source**.  
All rights are reserved, and usage, distribution, or modification without permission is not allowed.


- Enjoy SolPulse! If you have any questions, feel free to explore the additional documentation or reach out for support.