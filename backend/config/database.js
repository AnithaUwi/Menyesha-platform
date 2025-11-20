
const { Sequelize } = require('sequelize');
const path = require('path');

// SQLite database connection - NO SETUP REQUIRED!
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'menyesha.sqlite'), // Creates file automatically
  logging: false, // Clean console output
  dialectModule: require('better-sqlite3')
});

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite Database Connected Successfully!');
    console.log(' Database file: menyesha.sqlite (created automatically)');
  } catch (error) {
    console.error(' Database connection failed:', error);
  }
};

module.exports = { sequelize, testConnection };