const express = require('express');
const {
  getProblems,
  getProblemById,
  createProblem,
} = require('../controllers/codingProblemController');
const {
  submitCode,
  getProblemSubmissions,
} = require('../controllers/submissionController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, getProblems);
router.get('/:id', authMiddleware, getProblemById);
router.post('/', authMiddleware, createProblem);

// submission-related endpoints scoped to a problem
router.post('/:id/submit', authMiddleware, submitCode);
router.get('/:id/submissions', authMiddleware, getProblemSubmissions);

module.exports = router;