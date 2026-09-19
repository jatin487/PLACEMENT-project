const express = require('express');
const { getMySubmissions } = require('../controllers/submissionController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/me', authMiddleware, getMySubmissions);

module.exports = router;