# Capstone Project 2: Initial Project Ideas

## Crypto-Based Fitness App (Primary Choice)

### Overview
A fitness tracking app that integrates cryptocurrency. Users can earn cryptocurrency rewards (**Fitcoin**) based on their physical activities. By integrating with fitness trackers or mobile sensors, users can earn crypto for meeting goals like daily steps, workouts, or hitting personal records. These tokens can be used for rewards on the app or exchanged for real cryptocurrencies.

### Problem Solved
Many people struggle to stay consistent with their fitness, especially those involved in cryptocurrency. By gamifying the fitness process through crypto rewards, the app creates a direct incentive for users to engage in healthier lifestyles.

### Data Approach
This app would require a custom API for:
- Managing user profiles
- Tracking fitness data
- Distributing rewards

Integration with health data APIs will provide user activity data.

### Potential API Use
- **Fitness Tracking APIs**: Fitbit, Apple Health  
- **Cryptocurrency Data**: CoinGecko  
- **Blockchain Integration**: Web3.js for Fitcoin management  

---

## SolPulse (Final Choice) - Crypto Social Media Platform

### Overview
SolPulse is a **Solana-based social media platform** designed for **crypto enthusiasts and traders** to connect, share content, and trade. Unlike traditional platforms, users can **tip each other in Solana (SOL)** for valuable contributions, interact with **real-time cryptocurrency data**, and view trending assets in the **Solana ecosystem**.

### Problem Solved
Existing social media platforms lack incentives for quality content, often resulting in spam and low engagement. SolPulse rewards users for **creating high-value posts and discussions**, leveraging **crypto tipping and engagement-driven rewards**.

### Features
1. **User Authentication** – Secure login with JWT  
2. **Crypto Wallet Integration** – Connect Phantom wallet for tipping and trading  
3. **Social Features** – Create posts, repost, like, comment, and follow users  
4. **Real-Time Crypto Data** – Track Solana ecosystem cryptocurrencies  
5. **Tipping System** – Reward valuable content with **Solana tips**  
6. **Trending Coins & Market Data** – View real-time market trends  
7. **Notifications** – Get updates on interactions and price alerts  

### Data Approach
SolPulse uses a **custom API** to manage:
- User accounts and authentication
- Posts, reposts, likes, and comments
- Solana wallet connections and tipping transactions

### Potential API Use
- **CoinGecko API** – Fetch real-time Solana market data  
- **Dexscreener API** – Get meme coin price tracking  
- **Phantom Wallet API** – Enable tipping and transactions  
- **Web3.js** – Facilitate blockchain interactions  

---

## NFT-Based Event Ticketing System

### Overview
A decentralized platform for event ticketing where **tickets are issued as NFTs**. Users can **buy, sell, and transfer event tickets** on the blockchain, ensuring authenticity and preventing ticket fraud. Event organizers can also earn royalties from **secondary market sales**.

### Problem Solved
The event industry suffers from **counterfeit tickets and ticket scalping**. By using **NFTs**, each ticket remains **unique and traceable**, solving issues with ticket authenticity in resale markets.

### Data Approach
The platform would require:
- **Custom APIs** for user accounts, event management, and ticket purchases  
- **Smart Contracts** on Solana to manage ticket ownership and royalties  

### Potential API Use
- **Solana Blockchain** – Store ticket data as NFTs  
- **Magic Eden API** – Enable ticket resale on NFT marketplaces  
- **Web3.js** – Handle wallet interactions for buying/selling tickets  

---

## Final Decision: SolPulse 
After evaluating the initial ideas, **SolPulse** was chosen as the **final capstone project** due to its potential impact, scalability, and integration with the Solana ecosystem. The platform combines **crypto trading, social engagement, and content rewards**, making it unique in the blockchain space.

---
###  Next Steps:
1. **Build and refine SolPulse features**  
2. **Optimize API integrations for real-time crypto data**  
3. **Enhance security and user authentication**  
4. **Deploy and test wallet tipping & trading capabilities**  
5. **Launch beta version & gather user feedback**  

SolPulse is now a fully developed crypto social media platform with real-world applications. 
