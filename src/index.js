require('dotenv').config();
require('dotenv').config({ path: require('path').resolve(__dirname, '../server/.env'), override: false });

const express = require('express');
const cors = require('cors');
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

const app = express();

app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/proctoring', proctoringRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quizzes', assessmentRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/companies', companyRoutes);

// ── Database init ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

initializeDatabase()
  .then(() => {
    return sequelize.sync({ alter: true });
  })
  .then(async () => {
    console.log('MySQL database connected and models synchronized.');
    // Seed initial data if tables are empty
    await seedDatabase();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Unable to connect or sync with the database:', error);
  });

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: '🚀 Placement Portal API Backend is Live & Running with MySQL!',
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Placement Portal Backend is running' });
});
