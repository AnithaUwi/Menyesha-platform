// routes/complaints.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { validationResult, body } = require('express-validator');
const Complaint = require('../models/Complaint');
const User = require('../models/user');

const router = express.Router();

// Configure multer for complaint evidence
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/complaints/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'evidence-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// ✅ SUBMIT COMPLAINT (Anonymous or Authenticated)
router.post('/',
  upload.array('evidenceImages', 5), // Allow up to 5 images
  [
    body('description').notEmpty().withMessage('Description is required'),
    body('specificLocation').notEmpty().withMessage('Specific location is required'),
    body('province').notEmpty().withMessage('Province is required'),
    body('district').notEmpty().withMessage('District is required'),
    body('sector').notEmpty().withMessage('Sector is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg
        });
      }

      const {
        title,
        description,
        specificLocation,
        province,
        district,
        sector,
        cell,
        village,
        institution,
        category,
        anonymousName,
        anonymousEmail,
        anonymousPhone
      } = req.body;

      // Get citizen ID from token if authenticated
      let citizenId = null;
      if (req.headers.authorization) {
        try {
          const jwt = require('jsonwebtoken');
          const token = req.headers.authorization.split(' ')[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          citizenId = decoded.userId;
        } catch (error) {
          // Token invalid, treat as anonymous
        }
      }

      // Handle uploaded images
      const evidenceImages = req.files ? req.files.map(file => file.filename) : [];

      // Create complaint
      const complaint = await Complaint.create({
        title: title || 'Community Issue Report',
        description,
        specificLocation,
        province,
        district,
        sector,
        cell: cell || '',
        village: village || '',
        institution: institution || '',
        category: category || 'General',
        evidenceImages,
        citizenId,
        anonymousName: anonymousName || '',
        anonymousEmail: anonymousEmail || '',
        anonymousPhone: anonymousPhone || '',
        status: 'submitted',
        priority: 'medium'
      });

      res.status(201).json({
        success: true,
        message: citizenId ? 'Complaint submitted successfully!' : 'Complaint submitted anonymously!',
        complaint: {
          id: complaint.id,
          title: complaint.title,
          status: complaint.status,
          submittedAt: complaint.submittedAt
        }
      });

    } catch (error) {
      console.error('Complaint submission error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error during complaint submission'
      });
    }
  }
);

// ✅ GET COMPLAINTS (Role-based)
router.get('/', async (req, res) => {
  try {
    let whereClause = {};
    let include = [];

    // Check if user is authenticated
    if (req.headers.authorization) {
      try {
        const jwt = require('jsonwebtoken');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findByPk(decoded.userId);
        
        if (user.role === 'citizen') {
          // Citizens see only their complaints
          whereClause.citizenId = user.id;
        } else if (user.role === 'sector_admin') {
          // Sector admins see complaints from their sector
          whereClause.sector = user.sectorId; // This would need sector mapping
        } else if (user.role === 'institution_admin') {
          // Institution admins see complaints for their institution
          whereClause.institution = user.institutionId; // This would need institution mapping
        }
        // Super admin sees all (no where clause)
        
      } catch (error) {
        // Invalid token, return empty or handle accordingly
      }
    } else {
      // Anonymous users can't see complaints
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const complaints = await Complaint.findAll({
      where: whereClause,
      include: include,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      complaints: complaints
    });

  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching complaints'
    });
  }
});

// ✅ GET COMPLAINT STATISTICS
router.get('/stats', async (req, res) => {
  try {
    let whereClause = {};

    // Add role-based filtering similar to above
    if (req.headers.authorization) {
      // ... same role logic as above
    }

    const total = await Complaint.count({ where: whereClause });
    const submitted = await Complaint.count({ where: { ...whereClause, status: 'submitted' } });
    const inProgress = await Complaint.count({ where: { ...whereClause, status: 'in_progress' } });
    const resolved = await Complaint.count({ where: { ...whereClause, status: 'resolved' } });

    res.json({
      success: true,
      stats: {
        total,
        submitted,
        inProgress,
        resolved
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching statistics'
    });
  }
});

module.exports = router;