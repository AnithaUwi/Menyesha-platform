
const express = require('express');
const Complaint = require('../models/Complaint');
const User = require('../models/user');

const router = express.Router();

// Middleware to verify JWT and get user
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

//  CITIZEN DASHBOARD DATA
router.get('/citizen', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get complaint statistics
    const total = await Complaint.count({ where: { citizenId: userId } });
    const submitted = await Complaint.count({ where: { citizenId: userId, status: 'submitted' } });
    const inProgress = await Complaint.count({ where: { citizenId: userId, status: 'in_progress' } });
    const resolved = await Complaint.count({ where: { citizenId: userId, status: 'resolved' } });

    // Get recent complaints
    const recentComplaints = await Complaint.findAll({
      where: { citizenId: userId },
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      stats: {
        total,
        submitted,
        inProgress,
        resolved
      },
      recentComplaints: recentComplaints.map(complaint => ({
        id: complaint.id,
        title: complaint.title,
        description: complaint.description,
        location: complaint.specificLocation,
        status: complaint.status,
        submittedDate: complaint.createdAt,
        institution: complaint.institution
      })),
      user: {
        fullName: req.user.fullName,
        email: req.user.email,
        phone: req.user.phone
      }
    });

  } catch (error) {
    console.error('Citizen dashboard error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;