const express = require('express');
const {
  getAssessments,
  getAssessmentById,
  startAssessmentAttempt,
  submitAssessment,
  logViolation,
  getAttemptResult,
} = require('../controllers/assessmentController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, getAssessments);
router.get('/:id', authMiddleware, getAssessmentById);
router.post('/:id/start', authMiddleware, startAssessmentAttempt);
router.post('/:id/submit', authMiddleware, submitAssessment);
router.post('/:id/violation', authMiddleware, logViolation);
router.get('/:id/result', authMiddleware, getAttemptResult);

module.exports = router;
