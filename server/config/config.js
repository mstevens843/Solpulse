require('dotenv').config(); // Load environment variables

const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];

module.exports = {
  allowedOrigins, // Export allowedOrigins for CORS configuration
  development: {
    username: process.env.DB_USERNAME, // Database username
    password: process.env.DB_PASSWORD, // Database password
    database: process.env.DB_NAME, // Development database name
    host: process.env.DB_HOST, // Host address (e.g., localhost)
    dialect: 'postgres', // Database dialect (PostgreSQL)
    logging: true, // Log SQL queries in development
    pool: { // Connection pooling
      max: 5, // Maximum number of connections
      min: 0, // Minimum number of connections
      acquire: 30000, // Maximum time (ms) to acquire a connection
      idle: 10000, // Maximum time (ms) a connection can remain idle
    },
  },
  test: {
    username: process.env.DB_USERNAME, // Database username for tests
    password: process.env.DB_PASSWORD, // Database password for tests
    database: process.env.DB_NAME_TEST, // Test database name
    host: process.env.DB_HOST, // Host address
    dialect: 'postgres', // Database dialect (PostgreSQL)
    logging: false, // Disable logging in tests
    pool: { // Connection pooling
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      ssl: false, // Disable SSL for tests
    },
  },
  production: {
    username: 'cryptouser',
    password: 'FeXfTL8BPgpD99FNTqWLC4FSjDOMmyPA',
    database: 'solrise_db',
    host: 'dpg-cv0oa9dumphs739s4h10-a', // INTERNAL HOSTNAME from Render DB settings
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: { max: 10, min: 2, acquire: 30000, idle: 10000 },
  },
  }; 
