// config/syncDatabase.js
const { sequelize } = require('./database');
const User = require('../models/user');
const Complaint = require('../models/Complaint'); // ADD THIS

const syncDatabase = async () => {
  try {
    // Create all tables automatically
    await sequelize.sync({ alter : true });
    console.log('✅ Database tables created successfully!');
    console.log('📊 Tables: users, complaints'); // UPDATE THIS
  } catch (error) {
    console.error('❌ Error creating database tables:', error);
  }
};

module.exports = syncDatabase;