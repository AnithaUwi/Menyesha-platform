
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Complaint = sequelize.define('Complaint', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Problem details
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  specificLocation: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  // Rwanda location hierarchy
  province: {
    type: DataTypes.STRING,
    allowNull: false
  },
  district: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sector: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cell: {
    type: DataTypes.STRING
  },
  village: {
    type: DataTypes.STRING
  },
  
  // Institution
  institution: {
    type: DataTypes.STRING
  },
  category: {
    type: DataTypes.STRING
  },
  
  // Status and priority
  status: {
    type: DataTypes.ENUM('submitted', 'in_progress', 'resolved', 'closed'),
    defaultValue: 'submitted'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  
  // Evidence
  evidenceImages: {
    type: DataTypes.JSON, // Array of image filenames
    defaultValue: []
  },
  
  // User information (if logged in)
  citizenId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  // Anonymous user information
  anonymousName: {
    type: DataTypes.STRING
  },
  anonymousEmail: {
    type: DataTypes.STRING
  },
  anonymousPhone: {
    type: DataTypes.STRING
  },
  
  // Assignment
  assignedToId: {
    type: DataTypes.INTEGER, // Sector admin or institution admin ID
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  // Timelines
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  resolvedAt: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'complaints',
  timestamps: true
});

Complaint.associate = function(models) {
  Complaint.belongsTo(models.User, { 
    foreignKey: 'citizenId', 
    as: 'citizen' 
  });
};

module.exports = Complaint;