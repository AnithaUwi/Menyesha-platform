const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { validationResult, body } = require('express-validator');
const User = require('../models/user');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Create uploads folder
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'id-card-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

//  REGISTER - Citizens only (with file upload)
router.post('/register', 
  upload.single('idCard'), // Handle single file upload
  [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').notEmpty().withMessage('Phone number is required')
  ], 
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg
        });
      }

      const { fullName, email, password, phone, idType } = req.body;
      const idCardFile = req.file; // Get uploaded file

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User already exists with this email'
        });
      }

      // Create new user
      const user = await User.create({
        fullName,
        email,
        password,
        phone,
        idType: idType || '',
        idCard: idCardFile ? idCardFile.filename : '' // Save filename if uploaded
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Return success response
      res.status(201).json({
        success: true,
        message: 'User registered successfully!',
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });

    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error during registration'
      });
    }
  }
);


router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    const { email, password } = req.body;

    console.log(' LOGIN ATTEMPT:', { email, passwordLength: password?.length });

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log(' USER NOT FOUND:', email);
      return res.status(400).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    console.log(' USER FOUND:', {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      passwordStored: user.password ? `HASHED (${user.password.length} chars)` : 'NO PASSWORD',
      passwordPreview: user.password ? user.password.substring(0, 20) + '...' : 'none'
    });

    // Check if account is active
    if (user.status !== 'active') {
      console.log(' ACCOUNT INACTIVE:', email);
      return res.status(400).json({
        success: false,
        error: 'Account is not active'
      });
    }

   
    console.log(' COMPARING PASSWORDS...');
    console.log(' Provided password:', `"${password}" (${password?.length} chars)`);
    console.log(' Stored hash preview:', user.password?.substring(0, 20) + '...');
    
    const isPasswordValid = await user.comparePassword(password);
    console.log(' Password valid:', isPasswordValid);

    // Manual verification for debugging
    const manualCheck = await bcrypt.compare(password, user.password);
    console.log(' Manual bcrypt check:', manualCheck);

    if (!isPasswordValid) {
      console.log(' PASSWORD INVALID for user:', email);
      return res.status(400).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    console.log(' LOGIN SUCCESSFUL for user:', email, 'Role:', user.role);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return success response
    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error(' Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
});

module.exports = router;