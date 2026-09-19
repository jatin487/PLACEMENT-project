const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification
} = require('../controllers/notificationController');

// All notification routes are protected with auth middleware
router.get('/', auth, getNotifications);
router.post('/', auth, createNotification);

router.put('/read-all', auth, markAllAsRead);
router.patch('/read-all', auth, markAllAsRead);

router.put('/:id/read', auth, markAsRead);
router.patch('/:id/read', auth, markAsRead);

module.exports = router;
