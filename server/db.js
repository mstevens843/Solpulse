
require('dotenv').config(); // Load environment variables
const { Sequelize } = require('sequelize');

// Initialize Sequelize with environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME,          // Database name
  process.env.DB_USERNAME,      // Database username
  process.env.DB_PASSWORD,      // Database password
  {
    host: process.env.DB_HOST,  // Host (e.g., localhost)
    dialect: 'postgres',        // Use PostgreSQL
    logging: (msg) => console.log(`[Sequelize] ${msg}`), // Enable logging in all environments
    dialectOptions: process.env.NODE_ENV === 'production' ? { // Add SSL in production
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    } : {},
    pool: { // Add connection pooling
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Test the connection and handle errors gracefully
sequelize.authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
    process.exit(1); // Exit the process if connection fails (to avoid the app running in a bad state)
  });

module.exports = sequelize;