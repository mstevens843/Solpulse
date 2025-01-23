// What Happens Without This File?
// No Database Connection:

// Without this configuration, your application won’t have access to the database.
// Sequelize needs this file to understand how to connect to your database and manage models.
// Reusability:

// This centralized sequelize instance avoids repetitive database connection logic in other parts of the app.
// Scalability:

// Adding features like pooling, SSL, or logging configurations ensures your app performs efficiently and securely.
// If your app runs fine with the current setup, the suggested improvements are optional but add robustness and flexibility.

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




// Error Handling:
// Add error handling to catch connection issues during initialization or usage.
// Logging:
// Sequelize logs all SQL queries by default. If you want to minimize noise in production or testing environments, disable logging:
// SSL Support (Optional):
// If you're using a hosted PostgreSQL database (e.g., AWS RDS, Heroku, Supabase), you may need to enable SSL. Add ssl configuration:
// Pooling (Optional):
// Adding connection pooling for optimized database management (especially in production):