
const { sequelize } = require('./database');
const User = require('../models/user');
const Complaint = require('../models/Complaint');

const syncDatabase = async () => {
  try {
    
    await sequelize.sync({ force: false, alter: false });
    console.log(' Database connected successfully!');
    console.log(' Tables: users, complaints');
    
    // Set up model associations
    Object.keys(sequelize.models).forEach(modelName => {
      if (sequelize.models[modelName].associate) {
        sequelize.models[modelName].associate(sequelize.models);
      }
    });
    console.log(' Model associations set up successfully!');
    
  } catch (error) {
    console.error(' Database sync error:', error.message);
    console.log(' Tip: This is usually safe - your tables already exist');
  }
};

module.exports = syncDatabase;