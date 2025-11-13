const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'citizen'
  },
  idType: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  idCard: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active'
  },
  // ✅ NEW FIELDS ADDED FOR INSTITUTION ADMIN
  institutionName: {
    type: DataTypes.STRING
  },
  institutionCode: {
    type: DataTypes.STRING
  },
  institutionCategory: {
    type: DataTypes.STRING
  },
  institutionAddress: {
    type: DataTypes.STRING
  },
  institutionDescription: {
    type: DataTypes.TEXT
  },
  // ✅ NEW FIELDS ADDED FOR SECTOR ADMIN
  sectorName: {
    type: DataTypes.STRING
  },
  sectorCode: {
    type: DataTypes.STRING
  },
  province: {
    type: DataTypes.STRING
  },
  district: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Method to check password - KEEP EXISTING
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;