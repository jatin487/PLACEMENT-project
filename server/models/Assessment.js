const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['mcq', 'coding', 'mock'],
    required: true,
  },
  questions: {
    type: mongoose.Schema.Types.Mixed, // Array of questions or question IDs
    required: true,
  },
  totalScore: {
    type: Number,
    required: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Assessment', assessmentSchema);