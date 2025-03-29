require('dotenv').config(); // Load environment variables

const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];

module.exports = {
  allowedOrigins, // Export allowedOrigins for CORS configuration

  development: {
    username: process.env.DB_USERNAME,          // -> cryptouser
    password: process.env.DB_PASSWORD,          // -> cryptokarma1
    database: process.env.DB_NAME,              // -> solrise_db
    host: process.env.DB_HOST,                  // -> localhost
    dialect: 'postgres',
    logging: true,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },

  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_TEST,         // -> solrise_db_test
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: false,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },

  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // ✅ required for Render's SSL
      },
    },
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
  }
};
