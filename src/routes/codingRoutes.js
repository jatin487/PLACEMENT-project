const express = require('express');
const router = express.Router();
const codingController = require('../controllers/codingController');

router.get('/problems', codingController.getAllProblems);
router.get('/problems/:id', codingController.getProblemById);
router.post('/run', codingController.runCode);

module.exports = router;
