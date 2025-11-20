const express = require('express');
const User = require('../models/user');
const Complaint = require('../models/Complaint');
const auth = require('../middleware/auth');

const router = express.Router();

// Get sector admin profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('Get sector profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

// Get sector dashboard statistics
router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    const sectorAdmin = req.user;
    const sectorName = sectorAdmin.sectorName;

    console.log('Fetching stats for sector:', sectorName);

    // Get today's date for new complaints
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalComplaints = await Complaint.count({ 
      where: { sector: sectorName } 
    });
    
    const newComplaints = await Complaint.count({ 
      where: { 
        sector: sectorName,
        createdAt: { $gte: today }
      } 
    });
    
    const inProgress = await Complaint.count({ 
      where: { 
        sector: sectorName,
        status: 'in_progress' 
      } 
    });
    
    const resolved = await Complaint.count({ 
      where: { 
        sector: sectorName,
        status: 'resolved' 
      } 
    });

    console.log(' Sector complaint counts:', { totalComplaints, newComplaints, inProgress, resolved });

    res.json({
      success: true,
      data: {
        totalComplaints,
        newComplaints,
        inProgress,
        resolved,
        avgResolutionTime: "2.5 days",
        sectorName: sectorAdmin.sectorName,
        district: sectorAdmin.district,
        province: sectorAdmin.province,
        adminName: sectorAdmin.fullName
      }
    });
  } catch (error) {
    console.error('Sector stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats: ' + error.message });
  }
});

// Get complaints for sector
router.get('/complaints', auth, async (req, res) => {
  try {
    const sectorAdmin = req.user;
    const sectorName = sectorAdmin.sectorName;

    console.log(' Fetching complaints for sector:', sectorName);

    const { status, priority } = req.query;
    
    let whereClause = { sector: sectorName };
    
    if (status && status !== 'All Status') {
      whereClause.status = status.toLowerCase().replace(' ', '_');
    }
    
    if (priority && priority !== 'All Priority') {
      whereClause.priority = priority.toLowerCase();
    }

    const complaints = await Complaint.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    console.log(' Found', complaints.length, 'complaints for sector');

    // Format complaints for frontend
    const formattedComplaints = complaints.map(complaint => ({
      id: complaint.id,
      title: complaint.title,
      category: complaint.category,
      location: complaint.specificLocation,
      status: complaint.status,
      submittedDate: complaint.createdAt,
      citizen: complaint.anonymousName || 'Anonymous',
      priority: complaint.priority,
      description: complaint.description,
      institution: complaint.institution
    }));

    res.json({
      success: true,
      data: formattedComplaints
    });
  } catch (error) {
    console.error('Get sector complaints error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch complaints: ' + error.message });
  }
});

module.exports = router;