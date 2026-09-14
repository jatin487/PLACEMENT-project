const mongoose = require('mongoose');

const codingProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  statement: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  tags: {
    type: [String], // Array of strings
    required: false,
  },
  testCases: {
    type: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
        _id: false,
      }
    ],
    required: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('CodingProblem', codingProblemSchema);