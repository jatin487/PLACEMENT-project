const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getMyProfile,
  updateProfile,
  getProfileByUserId
} = require('../controllers/studentProfileController');

// Logged-in student profile routes
router.get('/me', auth, getMyProfile);
router.put('/me', auth, updateProfile);
router.patch('/me', auth, updateProfile);

// Public student profile by userId routes
router.get('/user/:userId', auth, getProfileByUserId);
router.get('/:userId', auth, getProfileByUserId);

module.exports = router;
