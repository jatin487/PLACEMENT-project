const express = require('express');
const {
  getAllAchievements,
  getMyAchievements,
  awardAchievement,
} = require('../controllers/achievementController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Middleware to restrict POST /api/achievements to admin/faculty only
const adminOnly = (req, res, next) => {
  if (!['admin', 'faculty'].includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or faculty role required.',
    });
  }
  next();
};

// GET /api/achievements/all  — public: catalogue of all available badges
router.get('/all', getAllAchievements);

// GET /api/achievements/me  — protected: logged-in user's earned achievements
router.get('/me', authMiddleware, getMyAchievements);

// POST /api/achievements  — protected + admin/faculty only: award an achievement
router.post('/', authMiddleware, adminOnly, awardAchievement);

module.exports = router;
