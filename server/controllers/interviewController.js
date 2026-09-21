const mongoose = require('mongoose');
const Interview = require('../models/Interview');

// Create ke time client se jo fields allowed hain
const CREATE_FIELDS = [
  'title',
  'type',
  'role',
  'company',
  'difficulty',
  'duration',
  'questions',
  'settings',
];

// Feedback/result update ke time allowed fields
const UPDATE_FIELDS = [
  'answers',
  'feedback',
  'result',
  'score',
  'status',
  'duration',
  'strengths',
  'improvements',
];

const pick = (obj = {}, keys = []) =>
  keys.reduce((acc, key) => {
    if (obj[key] !== undefined) acc[key] = obj[key];
    return acc;
  }, {});

const validationMessage = (err) =>
  Object.values(err.errors).map((e) => e.message).join(', ');

// @desc    Logged-in user ke saare practice interviews
// @route   GET /api/interviews?status=&page=&limit=
// @access  Private
exports.getInterviews = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

    const filter = { user: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const [interviews, total] = await Promise.all([
      Interview.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Interview.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: interviews.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: interviews,
    });
  } catch (err) {
    console.error('getInterviews error:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching interviews' });
  }
};

// @desc    Naya interview session create karo
// @route   POST /api/interviews
// @access  Private
exports.createInterview = async (req, res) => {
  try {
    const data = pick(req.body, CREATE_FIELDS);
    data.user = req.user._id; // hamesha token se, body se kabhi nahi

    const interview = await Interview.create(data);
    res.status(201).json({ success: true, message: 'Interview session created', data: interview });
  } catch (err) {
    console.error('createInterview error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: validationMessage(err) });
    }
    res.status(500).json({ success: false, message: 'Server error while creating interview' });
  }
};

// @desc    Interview detail fetch karo
// @route   GET /api/interviews/:id
// @access  Private (sirf owner)
exports.getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid interview id' });
    }

    // user filter ke saath query: doosre user ka interview 404 dega (id leak nahi hoti)
    const interview = await Interview.findOne({ _id: id, user: req.user._id });
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    res.json({ success: true, data: interview });
  } catch (err) {
    console.error('getInterviewById error:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching interview' });
  }
};

// @desc    Feedback aur result update karo
// @route   PUT /api/interviews/:id
// @access  Private (sirf owner)
exports.updateInterview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid interview id' });
    }

    const updates = pick(req.body, UPDATE_FIELDS);
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided to update' });
    }

    if (updates.score !== undefined) {
      const score = Number(updates.score);
      if (Number.isNaN(score) || score < 0 || score > 100) {
        return res.status(400).json({ success: false, message: 'Score must be a number between 0 and 100' });
      }
      updates.score = score;
    }

    // Interview complete hone par timestamp set karo
    if (updates.status === 'completed') {
      updates.completedAt = new Date();
    }

    const interview = await Interview.findOneAndUpdate(
      { _id: id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    res.json({ success: true, message: 'Interview updated', data: interview });
  } catch (err) {
    console.error('updateInterview error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: validationMessage(err) });
    }
    res.status(500).json({ success: false, message: 'Server error while updating interview' });
  }
};