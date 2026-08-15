require('dotenv').config();
// Also load server/.env for Firebase Admin credentials (local dev)
require('dotenv').config({ path: require('path').resolve(__dirname, '../server/.env'), override: false });

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const proctoringRoutes = require('./routes/proctoringRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────

// Existing auth routes (SQLite-backed)
app.use('/api/auth', authRoutes);

// Proctoring routes (Firebase Admin / Firestore-backed)
app.use('/api/proctoring', proctoringRoutes);

// ── Database init ─────────────────────────────────────────────────────────────

const initializeDatabase = require('./config/initDb');

const PORT = process.env.PORT || 5000;

initializeDatabase()
  .then(() => {
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('Database connected and models synchronized.');
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
    message: '🚀 Placement Portal API Backend is Live & Running!',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      proctoring: '/api/proctoring',
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Placement Portal Backend is running' });
});
