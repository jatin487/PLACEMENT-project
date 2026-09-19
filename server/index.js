require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const analyticsRoutes = require('./routes/analytics');
const assessmentRoutes = require('./routes/assessment');

const app = express();

connectDB();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://placementttttt-2.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/assessments', assessmentRoutes);

app.get('/', (req, res) => {
  res.json({
    app: 'AssessHub API',
    status: 'Running'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});