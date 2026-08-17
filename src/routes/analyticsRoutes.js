const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/leaderboard', analyticsController.getLeaderboard);
router.get('/me', authMiddleware, analyticsController.getMyAnalytics);
router.get('/badges/me', authMiddleware, analyticsController.getMyBadges);
router.get('/notifications', authMiddleware, analyticsController.getNotifications);
router.patch('/notifications/:id/read', authMiddleware, analyticsController.markRead);

module.exports = router;
