const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  faculty: { type: String },
  date: { type: String },
  duration: { type: String },
  videoUrl: { type: String },
  thumbnail: { type: String },
  description: { type: String },
  tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('Lecture', lectureSchema);