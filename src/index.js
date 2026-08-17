require('dotenv').config();
require('dotenv').config({ path: require('path').resolve(__dirname, '../server/.env'), override: false });

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { sequelize } = require('./models');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const proctoringRoutes = require('./routes/proctoringRoutes');
const lectureRoutes = require('./routes/lectureRoutes');
const courseRoutes = require('./routes/courseRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const codingRoutes = require('./routes/codingRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const companyRoutes = require('./routes/companyRoutes');

// Database seeder
const initializeDatabase = require('./config/initDb');
const seedDatabase = require('./config/seedDb');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../uploads/videos');
const thumbsDir = path.join(__dirname, '../uploads/thumbnails');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir, { recursive: true });

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Root & Health Check Endpoints (for Render & uptime monitors) ──────────────

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: '🚀 Placement Portal API Backend is Live & Running!',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      lectures: '/api/lectures',
      courses: '/api/courses',
      quizzes: '/api/quizzes',
      coding: '/api/coding',
      analytics: '/api/analytics',
      companies: '/api/companies',
      proctoring: '/api/proctoring',
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    message: 'Placement Portal Backend is healthy'
  });
});

// ── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/proctoring', proctoringRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quizzes', assessmentRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/companies', companyRoutes);

// 404 handler for unknown API routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// ── Server Listen & Database Init ─────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Placement Portal Backend listening on port ${PORT}`);

  // Initialize and synchronize database in background
  initializeDatabase()
    .then(() => sequelize.sync({ alter: true }))
    .then(async () => {
      console.log('✅ Database connected and models synchronized successfully.');
      await seedDatabase();
      console.log('✅ Initial database seed checked/completed.');
    })
    .catch((err) => {
      console.error('⚠️ Database connection notice:', err?.message || err);
      console.info('Server remains alive for requests & health checks.');
    });
});
