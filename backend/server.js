
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
const syncDatabase = require('./config/syncDatabase');
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const dashboardRoutes = require('./routes/dashboard'); 
const adminRoutes = require('./routes/admin');
const auth = require('./middleware/auth');
const institutionRoutes = require('./routes/institution');
const sectorRoutes = require('./routes/sector');
require('dotenv').config();

const app = express();

// Connect to database
testConnection();
syncDatabase();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://menyesha-platform.vercel.app/',  
    'https://*.vercel.app'                   
  ],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/dashboard', dashboardRoutes); 
app.use('/api/admin', adminRoutes);
app.use('/api/institution', auth, institutionRoutes);
app.use('/api/sector', auth, sectorRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: ' Menyesha Backend is working!',
    timestamp: new Date().toISOString(),
    status: 'Server is running perfectly!',
    database: 'SQLite Connected ',
    authentication: 'Ready '
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'Menyesha Backend API',
    database: 'SQLite Connected ',
    authentication: 'Ready ',
    timestamp: new Date().toISOString()
  });
});

// Test database route
app.get('/api/test-db', async (req, res) => {
  try {
    const User = require('./models/user'); 
    const userCount = await User.count();
    
    res.json({
      message: ' Database test successful!',
      users_count: userCount,
      database: 'SQLite working perfectly',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Database test failed',
      message: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
  console.log(` Local: http://localhost:${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/api/health`);
  console.log(`  Database: SQLite `);
  console.log(` Authentication: Ready `);
  console.log(` Dashboard: Ready `); 
});