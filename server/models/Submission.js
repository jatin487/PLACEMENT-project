const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
      unique: true,
    },

    studentId: {
      type: String,
      required: true,
    },

    problemId: {
      type: String,
      required: true,
    },

    code: {
      type: String,
      required: true,
    },

    language: {
      type: String,
      required: true,
      default: 'cpp',
    },

    verdict: {
      type: String,
      enum: [
        'Accepted',
        'Wrong Answer',
        'Time Limit Exceeded',
        'Compilation Error',
        'Runtime Error',
      ],
      required: true,
    },

    runtime: {
      type: Number,
      required: false,
    },

    score: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Submission', SubmissionSchema);