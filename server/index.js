require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

const app = express();

<<<<<<< HEAD
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({
    app: 'AssessHub API',
    status: 'Running'
  });
});

=======
// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    app: 'Placement Portal API',
    status: 'Running',
  });
});

// Health Endpoint
>>>>>>> b467758ccab55598f443e035bd35e468d347134d
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
<<<<<<< HEAD
});
=======
});
>>>>>>> b467758ccab55598f443e035bd35e468d347134d
