const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '/../config/config.js'))[env];
const db = {};

let sequelize;

sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    ...config,
    logging: env === 'development' ? console.log : false,
  }
);



try {
  // Read model files from the current directory
  const modelFiles = fs
    .readdirSync(__dirname)
    .filter(
      (file) =>
        file.indexOf('.') !== 0 && // Ignore hidden files
        file !== basename && // Exclude this file
        (file.slice(-3) === '.js' || file.slice(-3) === '.ts') // Include .js or .ts files
    );

  // Import and initialize models
  modelFiles.forEach((file) => {
    console.log(`Loading model file: ${file}`);
    try {
      const model = require(path.join(__dirname, file));
      if (typeof model !== 'function') {
        throw new Error(`Export from model file "${file}" is not a function.`);
      }
      const initializedModel = model(sequelize, Sequelize.DataTypes);
      db[initializedModel.name] = initializedModel;
    } catch (err) {
      console.error(`Error loading model file "${file}":`, err.message);
      console.error(err.stack);
      process.exit(1);
    }
  });

  // Associate models
  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      console.log(`Associating model: ${modelName}`);
      try {
        db[modelName].associate(db);
      } catch (err) {
        console.error(`Error associating model "${modelName}":`, err.message);
        console.error(err.stack);
        process.exit(1);
      }
    }
  });

  // Explicit associations
  const { Notification, Follower, User } = db;

  // Notifications: Link userId and actorId to User
  if (Notification) {
    Notification.belongsTo(User, { as: 'Recipient', foreignKey: 'userId' });
    Notification.belongsTo(User, { as: 'Actor', foreignKey: 'actorId' });
  }

  // Followers: Link followerId and followingId to User
  if (Follower) {
    Follower.belongsTo(User, { as: 'Follower', foreignKey: 'followerId' });
    Follower.belongsTo(User, { as: 'Following', foreignKey: 'followingId' });
  }
} catch (err) {
  console.error('Unexpected error initializing models:', err.message);
  console.error(err.stack);
  process.exit(1);
}

// Export Sequelize instance and models
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;