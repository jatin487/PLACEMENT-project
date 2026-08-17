const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', assessmentController.getAllAssessments);
router.get('/:id', assessmentController.getAssessmentById);
router.post('/', authMiddleware, assessmentController.createAssessment);
router.post('/:id/submit', authMiddleware, assessmentController.submitAssessment);

module.exports = router;
