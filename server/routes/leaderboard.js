const express = require('express');
const { getLeaderboard, getMyRank } = require('../controllers/leaderboardController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/leaderboard?department=CSE&period=thisMonth&limit=50
router.get('/', getLeaderboard);

// GET /api/leaderboard/me?department=CSE&period=allTime  (protected)
router.get('/me', authMiddleware, getMyRank);

module.exports = router;
