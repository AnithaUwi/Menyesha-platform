const express = require('express');
const User = require('../models/user');
const Complaint = require('../models/Complaint');
const auth = require('../middleware/auth');

const router = express.Router();

// Get institution admin profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('Get institution profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

// Get institution dashboard statistics
router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    const institutionAdmin = req.user;
    const institutionName = institutionAdmin.institutionName;

    console.log('📊 Fetching stats for institution:', institutionName);

    // Get complaints for this institution
    const totalComplaints = await Complaint.count({ 
      where: { institution: institutionName } 
    });
    
    const resolvedComplaints = await Complaint.count({ 
      where: { 
        institution: institutionName,
        status: 'resolved' 
      } 
    });
    
    const inProgressComplaints = await Complaint.count({ 
      where: { 
        institution: institutionName,
        status: 'in_progress' 
      } 
    });

    console.log('📈 Complaint counts:', { totalComplaints, resolvedComplaints, inProgressComplaints });

    // Calculate average resolution time
    let avgResolutionTime = "0 days";
    try {
      const resolvedComplaintsData = await Complaint.findAll({
        where: { 
          institution: institutionName,
          status: 'resolved',
          resolvedAt: { $ne: null }
        },
        attributes: ['createdAt', 'resolvedAt']
      });

      if (resolvedComplaintsData.length > 0) {
        const totalDays = resolvedComplaintsData.reduce((sum, complaint) => {
          const resolutionTime = new Date(complaint.resolvedAt) - new Date(complaint.createdAt);
          return sum + (resolutionTime / (1000 * 60 * 60 * 24));
        }, 0);
        avgResolutionTime = `${(totalDays / resolvedComplaintsData.length).toFixed(1)} days`;
      }
    } catch (timeError) {
      console.log('⏰ Could not calculate resolution time, using default');
    }

    res.json({
      success: true,
      data: {
        totalComplaints,
        resolvedThisMonth: resolvedComplaints,
        inProgress: inProgressComplaints,
        avgResolutionTime,
        institutionName: institutionAdmin.institutionName,
        institutionCode: institutionAdmin.institutionCode,
        systemUptime: "99.8%",
        activeInstitutions: 1, // This institution only
        activeSectors: 0 // Not applicable for institution admin
      }
    });
  } catch (error) {
    console.error('Institution stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats: ' + error.message });
  }
});

// Get complaints for institution
router.get('/complaints', auth, async (req, res) => {
  try {
    const institutionAdmin = req.user;
    const institutionName = institutionAdmin.institutionName;

    console.log('📋 Fetching complaints for institution:', institutionName);

    const { status, priority } = req.query;
    
    let whereClause = { institution: institutionName };
    
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

    console.log('✅ Found', complaints.length, 'complaints');

    // Format complaints for frontend
    const formattedComplaints = complaints.map(complaint => ({
      id: complaint.id,
      title: complaint.title,
      description: complaint.description,
      location: complaint.specificLocation,
      category: complaint.category,
      submittedBy: complaint.anonymousName || 'Anonymous',
      submittedDate: complaint.createdAt,
      status: complaint.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      priority: complaint.priority.toUpperCase(),
      assignedSector: complaint.sector,
      evidenceImages: complaint.evidenceImages
    }));

    res.json({
      success: true,
      data: formattedComplaints
    });
  } catch (error) {
    console.error('Get institution complaints error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch complaints: ' + error.message });
  }
});

module.exports = router;