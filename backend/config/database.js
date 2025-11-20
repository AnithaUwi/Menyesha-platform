const { Sequelize } = require('sequelize');

// Use PostgreSQL in production, SQLite in development
const sequelize = new Sequelize(
  process.env.NODE_ENV === 'production' 
    ? process.env.DATABASE_URL // PostgreSQL from Render
    : {
        dialect: 'sqlite',
        storage: './menyesha.sqlite',
        logging: false
      },
  {
    dialect: process.env.NODE_ENV === 'production' ? 'postgres' : 'sqlite',
    logging: false,
    dialectOptions: process.env.NODE_ENV === 'production' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  }
);

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database Connected Successfully!');
    console.log(`📊 Using: ${process.env.NODE_ENV === 'production' ? 'PostgreSQL (Render)' : 'SQLite (Local)'}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
};

module.exports = { sequelize, testConnection };