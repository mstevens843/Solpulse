# 🌐 SolPulse Frontend Features

## 🏦 Solana Wallet Integration
SolPulse **integrates with Solana wallets** using the **Solana Wallet Adapter**. This allows users to:
- **Connect their Phantom wallet**
- **Fetch wallet balance**
- **Send SOL transactions**
- **Send crypto tips directly to other users**

### 🚀 Technologies Used
- **Solana Wallet Adapter** for seamless wallet integration.
- **Solana Web3.js** to interact with the blockchain.
- **React Context API** for wallet state management.

### 🔹 Wallet Functionalities
1️⃣ **Connect Wallet:**  
- Users can connect their Phantom Wallet.
- No wallet details are stored on the backend.

2️⃣ **Fetch Wallet Balance:**  
- Uses `solana/web3.js` to retrieve SOL balance.

3️⃣ **Send Transactions:**  
- Users can send SOL using Phantom Wallet.
- Transactions **are signed & sent by the user** (no backend processing).

4️⃣ **Crypto Tips:**  
- Users can tip other users directly from their wallet.

---

## 🎛️ Token Modal (`TokenModal.js`)
- Allows users to **search and select tokens**.
- Uses `fetchTokenInfo()` to retrieve token details dynamically.
- **Supports both wallet tokens and searched tokens**.

---

## 📜 Transaction History (`CryptoTransaction.js`)
- Fetches **latest transactions** for a wallet.
- Filters **Sent, Received, Tips** transactions.
- Uses **Solana Web3.js** for real-time blockchain data.

---

📌 **Since this is all handled client-side, no wallet data is stored on SolPulse servers.**
