const { defineConfig } = require("cypress");

module.exports = defineConfig({
  env: {
    SOLANA_NETWORK: process.env.VITE_SOLANA_NETWORK || "mainnet-beta",
    SOLANA_RPC_ENDPOINT: process.env.VITE_SOLANA_RPC_ENDPOINT || "https://api.mainnet-beta.solana.com",
    CYPRESS_API_BASE_URL: process.env.CYPRESS_API_BASE_URL || "http://localhost:5000/api", // Updated to use the root env variable
    CYPRESS_WEBSOCKET_URL: process.env.CYPRESS_WEBSOCKET_URL || "ws://localhost:5000", // Updated to use the root env variable
    GOOGLE_ANALYTICS_ID: process.env.VITE_GOOGLE_ANALYTICS_ID || "",
    CRYPTO_API_KEY: process.env.VITE_CRYPTO_API_KEY || "",
  },
  e2e: {
    baseUrl: "http://localhost:3000", // Updated for Vite frontend port
    viewportWidth: 1280, // Increase width
    viewportHeight: 1200, // Increase height
    setupNodeEvents(on, config) {
      // You can also modify config during runtime if needed
      return config;
    },
  },
});


