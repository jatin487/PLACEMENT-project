const mongoose = require('mongoose');

const assessmentAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  submittedAt: {
    type: Date,
    default: null,
  },
  answers: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  score: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['in_progress', 'submitted', 'completed'],
    default: 'in_progress',
  },
  violations: [
    {
      type: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      description: {
        type: String,
        default: '',
      },
      sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AssessmentAttempt',
        default: null,
      },
    },
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model('AssessmentAttempt', assessmentAttemptSchema);
