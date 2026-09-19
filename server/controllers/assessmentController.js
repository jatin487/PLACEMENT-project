const Assessment = require('../models/Assessment');
const AssessmentAttempt = require('../models/AssessmentAttempt');

const normalizeQuestionType = (questionType) => {
  if (!questionType) return '';
  return String(questionType).trim().toLowerCase();
};

const getQuestionPoints = (question) => {
  if (!question || typeof question !== 'object') return 1;

  const value = Number(question.points ?? question.score ?? 1);
  return Number.isFinite(value) && value > 0 ? value : 1;
};

const getNormalizedAnswerValue = (value) => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map((item) => String(item).trim().toLowerCase());
  return String(value).trim().toLowerCase();
};

const calculateMCQScore = (assessment, submittedAnswers = {}) => {
  if (!assessment || !Array.isArray(assessment.questions)) return 0;

  let score = 0;

  assessment.questions.forEach((question, index) => {
    const questionType = normalizeQuestionType(question?.type);
    if (!['mcq', 'multiple-choice', 'single-choice', 'objective'].includes(questionType)) {
      return;
    }

    const questionPoints = getQuestionPoints(question);
    const userAnswer = submittedAnswers[index] ?? submittedAnswers[question._id ?? index] ?? submittedAnswers[String(index)];
    const correctAnswer = question.correctAnswer ?? question.answer ?? question.correct;

    const normalizedUserAnswer = getNormalizedAnswerValue(userAnswer);
    const normalizedCorrectAnswer = getNormalizedAnswerValue(correctAnswer);

    const isCorrect = Array.isArray(normalizedCorrectAnswer)
      ? JSON.stringify(normalizedCorrectAnswer.slice().sort()) === JSON.stringify(Array.isArray(normalizedUserAnswer) ? normalizedUserAnswer.slice().sort() : [normalizedUserAnswer])
      : normalizedUserAnswer === normalizedCorrectAnswer;

    if (isCorrect) {
      score += questionPoints;
    }
  });

  return score;
};

exports.getAssessments = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = {};

    if (type) {
      filter.type = String(type).trim().toLowerCase();
    }

    const assessments = await Assessment.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assessments.length,
      assessments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch assessments', error: error.message });
  }
};

exports.getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    res.status(200).json({
      success: true,
      assessment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch assessment', error: error.message });
  }
};

exports.startAssessmentAttempt = async (req, res) => {
  try {
    const assessmentId = req.params.id;
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User is required to start an assessment' });
    }

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    const activeAttempt = await AssessmentAttempt.findOne({
      userId,
      assessmentId,
      status: 'in_progress',
    }).sort({ startedAt: -1 });

    if (activeAttempt) {
      return res.status(200).json({
        success: true,
        message: 'Existing assessment attempt resumed',
        attempt: activeAttempt,
      });
    }

    const attempt = await AssessmentAttempt.create({
      userId,
      assessmentId,
      startedAt: new Date(),
      status: 'in_progress',
      answers: {},
      score: 0,
      violations: [],
    });

    res.status(201).json({
      success: true,
      message: 'Assessment attempt started successfully',
      attempt,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to start assessment attempt', error: error.message });
  }
};

exports.submitAssessment = async (req, res) => {
  try {
    const assessmentId = req.params.id;
    const userId = req.user?.id || req.body.userId;
    const submittedAnswers = req.body.answers || {};

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    const attempt = await AssessmentAttempt.findOne({
      userId,
      assessmentId,
      status: { $in: ['in_progress', 'submitted'] },
    }).sort({ startedAt: -1 });

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'No active assessment attempt found' });
    }

    const score = calculateMCQScore(assessment, submittedAnswers);

    attempt.answers = submittedAnswers;
    attempt.score = score;
    attempt.status = 'submitted';
    attempt.submittedAt = new Date();
    await attempt.save();

    res.status(200).json({
      success: true,
      message: 'Assessment submitted successfully',
      attempt: {
        ...attempt.toObject(),
        totalScore: assessment.totalScore ?? 0,
      },
      score,
      totalScore: assessment.totalScore ?? 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit assessment', error: error.message });
  }
};

exports.logViolation = async (req, res) => {
  try {
    const assessmentId = req.params.id;
    const userId = req.user?.id || req.body.userId;
    const { type, timestamp, description, sessionId } = req.body;

    if (!type) {
      return res.status(400).json({ success: false, message: 'Violation type is required' });
    }

    let attempt = null;

    if (sessionId) {
      attempt = await AssessmentAttempt.findById(sessionId);
    }

    if (!attempt) {
      attempt = await AssessmentAttempt.findOne({
        userId,
        assessmentId,
        status: { $in: ['in_progress', 'submitted'] },
      }).sort({ startedAt: -1 });
    }

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'No matching assessment attempt found for violation logging' });
    }

    const violation = {
      type,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      description: description || '',
      sessionId: attempt._id,
    };

    attempt.violations.push(violation);
    await attempt.save();

    res.status(201).json({
      success: true,
      message: 'Violation logged successfully',
      violation,
      attempt,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to log violation', error: error.message });
  }
};

exports.getAttemptResult = async (req, res) => {
  try {
    const assessmentId = req.params.id;
    const userId = req.user?.id || req.query.userId;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User is required to fetch the assessment result' });
    }

    const attempt = await AssessmentAttempt.findOne({
      userId,
      assessmentId,
    }).sort({ startedAt: -1 });

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'No attempt found for this assessment' });
    }

    const assessment = await Assessment.findById(assessmentId);

    res.status(200).json({
      success: true,
      result: {
        attempt,
        assessmentTitle: assessment?.title || '',
        totalScore: assessment?.totalScore ?? 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch assessment result', error: error.message });
  }
};
