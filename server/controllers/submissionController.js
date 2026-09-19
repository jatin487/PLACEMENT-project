const Submission = require('../models/Submission');
const CodingProblem = require('../models/CodingProblem');
const User = require('../models/User');

// Points awarded per difficulty when verdict is "Accepted"
const POINTS_BY_DIFFICULTY = {
  easy: 10,
  medium: 20,
  hard: 30,
};

exports.submitCode = async (req, res) => {
  try {
    const problemId = req.params.id;
    const studentId = req.user?.id;
    const { code, language, verdict, runtime } = req.body;

    if (!studentId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!code || !verdict) {
      return res.status(400).json({ success: false, message: 'code and verdict are required' });
    }

    const problem = await CodingProblem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    let score = 0;
    if (verdict === 'Accepted') {
      score = POINTS_BY_DIFFICULTY[problem.difficulty] || 10;
    }

    const submission = await Submission.create({
      studentId,
      problemId,
      code,
      language: language || 'cpp',
      verdict,
      runtime,
      score,
    });

    // Update user's skill points only when the submission is accepted
    if (verdict === 'Accepted') {
      await User.findByIdAndUpdate(studentId, { $inc: { skillPoints: score } });
    }

    res.status(201).json({
      success: true,
      message: 'Submission recorded successfully',
      submission,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit code', error: error.message });
  }
};

exports.getProblemSubmissions = async (req, res) => {
  try {
    const problemId = req.params.id;
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const submissions = await Submission.find({ problemId, studentId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch submissions', error: error.message });
  }
};

exports.getMySubmissions = async (req, res) => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const submissions = await Submission.find({ studentId })
      .populate('problemId', 'title difficulty')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch submission history', error: error.message });
  }
};