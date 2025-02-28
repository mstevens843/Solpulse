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
    username: process.env.DB_USERNAME, // Production database username
    password: process.env.DB_PASSWORD, // Production database password
    database: process.env.DB_NAME, // Production database name
    host: process.env.DB_HOST, // Host address
    dialect: 'postgres', // Database dialect (PostgreSQL)
    logging: false, // Disable logging in production
    dialectOptions: {
      ssl: {
        require: true, // Render requires SSL
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    },
    pool: { // Connection pooling
      max: 10, // Higher max connections for production
      min: 2, // Maintain minimum connections
      acquire: 30000,
      idle: 10000,
    },
  },
};
