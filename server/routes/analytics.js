const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getMyAnalytics } = require('../controllers/analyticsController');

router.get('/me', auth, getMyAnalytics);

module.exports = router;