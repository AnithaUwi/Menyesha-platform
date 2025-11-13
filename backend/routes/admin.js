const express = require('express');
const { validationResult, body } = require('express-validator');
const User = require('../models/user');
const { sequelize } = require('../config/database'); // Import sequelize instance

const router = express.Router();

// ✅ CREATE INSTITUTION ADMIN (Super Admin Only)
router.post('/create-institution', 
  [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('institutionName').notEmpty().withMessage('Institution name is required'),
    body('institutionCode').notEmpty().withMessage('Institution code is required')
  ],
  async (req, res) => {
    try {
      console.log('📥 Received request to create institution:', req.body);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ Validation errors:', errors.array());
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg
        });
      }

      const { 
        fullName, email, password, phone, 
        institutionName, institutionCode, institutionCategory, 
        institutionAddress, institutionDescription 
      } = req.body;

      console.log('🔍 Checking if user exists:', email);

      // Check if email already exists using Sequelize
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        console.log('❌ User already exists with email:', email);
        return res.status(400).json({
          success: false,
          error: 'User with this email already exists'
        });
      }

      // Check if institution code already exists using Sequelize
      const existingInstitution = await User.findOne({ 
        where: { 
          institutionCode,
          role: 'institution_admin' 
        } 
      });
      
      if (existingInstitution) {
        console.log('❌ Institution code already exists:', institutionCode);
        return res.status(400).json({
          success: false,
          error: 'Institution with this code already exists'
        });
      }

      console.log('💾 Creating institution admin in database...');
      // Create institution admin using Sequelize
      const user = await User.create({
        fullName,
        email,
        password: password, // Use plain password - model hook will hash it
        phone,
        role: 'institution_admin',
        institutionName,
        institutionCode: institutionCode.toUpperCase(),
        institutionCategory: institutionCategory || '',
        institutionAddress: institutionAddress || '',
        institutionDescription: institutionDescription || '',
        status: 'active'
      });

      console.log('✅ Institution admin created with ID:', user.id);
      console.log('🔐 Password stored (should be hashed):', user.password ? user.password.substring(0, 20) + '...' : 'No password');

      res.status(201).json({
        success: true,
        message: 'Institution admin created successfully!',
        data: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          institutionName: user.institutionName,
          institutionCode: user.institutionCode,
          status: user.status,
          createdAt: user.createdAt
        }
      });

    } catch (error) {
      console.error('❌ Create institution admin error:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Stack trace:', error.stack);
      
      res.status(500).json({
        success: false,
        error: 'Server error during institution creation: ' + error.message
      });
    }
  }
);

// ✅ CREATE SECTOR ADMIN (Super Admin Only) - FIXED PASSWORD
router.post('/create-sector', 
  [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('sectorName').notEmpty().withMessage('Sector name is required'),
    body('sectorCode').notEmpty().withMessage('Sector code is required')
  ],
  async (req, res) => {
    try {
      console.log('📥 Received request to create sector admin:', req.body);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg
        });
      }

      const { 
        fullName, email, password, phone, 
        sectorName, sectorCode, province, district 
      } = req.body;

      // Check if email already exists using Sequelize
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User with this email already exists'
        });
      }

      // Check if sector code already exists using Sequelize
      const existingSector = await User.findOne({ 
        where: { 
          sectorCode,
          role: 'sector_admin' 
        } 
      });
      
      if (existingSector) {
        return res.status(400).json({
          success: false,
          error: 'Sector with this code already exists'
        });
      }

      // Create sector admin using Sequelize - USE PLAIN PASSWORD
      const user = await User.create({
        fullName,
        email,
        password: password, // Use plain password - model hook will hash it
        phone,
        role: 'sector_admin',
        sectorName,
        sectorCode: sectorCode.toUpperCase(),
        province: province || '',
        district: district || '',
        status: 'active'
      });

      console.log('✅ Sector admin created with ID:', user.id);
      console.log('🔐 Password stored (should be hashed):', user.password ? user.password.substring(0, 20) + '...' : 'No password');

      res.status(201).json({
        success: true,
        message: 'Sector admin created successfully!',
        data: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          sectorName: user.sectorName,
          sectorCode: user.sectorCode,
          province: user.province,
          district: user.district,
          status: user.status,
          createdAt: user.createdAt
        }
      });

    } catch (error) {
      console.error('❌ Create sector admin error:', error);
      console.error('❌ Error details:', error.message);
      
      res.status(500).json({
        success: false,
        error: 'Server error during sector admin creation: ' + error.message
      });
    }
  }
);

// ✅ GET ALL INSTITUTION ADMINS
router.get('/institutions', async (req, res) => {
  try {
    const institutionAdmins = await User.findAll({
      where: { role: 'institution_admin' },
      attributes: { 
        exclude: ['password', 'idCard', 'idType'] 
      },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: institutionAdmins
    });
  } catch (error) {
    console.error('Get institutions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch institutions'
    });
  }
});

// ✅ GET ALL SECTOR ADMINS
router.get('/sectors', async (req, res) => {
  try {
    const sectorAdmins = await User.findAll({
      where: { role: 'sector_admin' },
      attributes: { 
        exclude: ['password', 'idCard', 'idType'] 
      },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: sectorAdmins
    });
  } catch (error) {
    console.error('Get sectors error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sectors'
    });
  }
});

// ✅ GET DASHBOARD STATISTICS
router.get('/dashboard-stats', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalCitizens = await User.count({ where: { role: 'citizen' } });
    const totalInstitutionAdmins = await User.count({ where: { role: 'institution_admin' } });
    const totalSectorAdmins = await User.count({ where: { role: 'sector_admin' } });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalCitizens,
        totalInstitutionAdmins,
        totalSectorAdmins,
        totalComplaints: 0,
        resolvedComplaints: 0,
        activeInstitutions: totalInstitutionAdmins,
        activeSectors: totalSectorAdmins,
        avgResolutionTime: "2.5 days",
        systemUptime: "99.8%"
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dashboard statistics' 
    });
  }
});

// ✅ UPDATED TEST ROUTE USING SEQUELIZE
router.get('/test-db', async (req, res) => {
  try {
    console.log('🧪 Testing database connection with Sequelize...');
    
    // Test basic query
    const totalUsers = await User.count();
    console.log('✅ Basic query works. Total users:', totalUsers);
    
    // Test if we can create a record
    const testUser = await User.create({
      fullName: 'Test User',
      email: 'test@test.com',
      password: 'test123', // Plain password - model will hash it
      phone: '+250788000000',
      role: 'citizen',
      status: 'active'
    });
    console.log('✅ Insert test passed. New ID:', testUser.id);
    console.log('🔐 Test user password stored:', testUser.password ? testUser.password.substring(0, 20) + '...' : 'No password');
    
    // Clean up
    await User.destroy({ where: { email: 'test@test.com' } });
    console.log('✅ Cleanup completed');
    
    res.json({
      success: true,
      message: 'Database connection is working perfectly with Sequelize!',
      totalUsers: totalUsers,
      testInsertId: testUser.id
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Database test failed: ' + error.message
    });
  }
});

// Get all users with filtering
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { 
        exclude: ['password', 'idCard', 'idType'] 
      },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({ 
      success: true, 
      data: users 
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch users' 
    });
  }
});

// Activate/Deactivate user
// ✅ CORRECT: Update user status (individual user only)
router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`🔄 Updating user ${id} status to: ${status}`);

    // Find the SPECIFIC user by ID only
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Update only this specific user
    user.status = status;
    await user.save();

    console.log(`✅ Updated ONLY user ${user.email} to status: ${status}`);

    res.json({ 
      success: true, 
      message: `User ${status} successfully`
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update user status' 
    });
  }
});

// Toggle institution status
router.put('/institutions/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const institution = await User.findByPk(id);
    if (!institution) {
      return res.status(404).json({ 
        success: false, 
        error: 'Institution not found' 
      });
    }
    
    institution.status = status;
    await institution.save();
    
    res.json({ 
      success: true, 
      message: `Institution ${status} successfully` 
    });
  } catch (error) {
    console.error('Update institution status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update institution status' 
    });
  }
});

// Toggle institution status
router.put('/institutions/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const institution = await User.findByPk(id);
    if (!institution) {
      return res.status(404).json({ 
        success: false, 
        error: 'Institution not found' 
      });
    }
    
    institution.status = status;
    await institution.save();
    
    res.json({ 
      success: true, 
      message: `Institution ${status} successfully` 
    });
  } catch (error) {
    console.error('Update institution status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update institution status' 
    });
  }
});
module.exports = router;