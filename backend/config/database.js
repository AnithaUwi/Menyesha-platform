const { Sequelize } = require('sequelize');
const path = require('path');

// Use Sequelize's built-in SQLite dialect (removed dialectModule)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'menyesha.sqlite'),
  logging: false, // Clean console output
  // REMOVED: dialectModule: require('sql.js')
});

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite Database Connected Successfully!');
    console.log('📁 Database file: menyesha.sqlite');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    // Don't throw - let server continue running
  }
};

module.exports = { sequelize, testConnection };