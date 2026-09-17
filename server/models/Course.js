const mongoose = require('mongoose');

const ModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  order: { type: Number },
}, { _id: false });

const VideoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  title: { type: String },
  duration: { type: Number }, // seconds
}, { _id: false });

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    modules: [ModuleSchema],
    videos: [VideoSchema],
    notes: [String],     // Array of URLs
    quizzes: [String],   // Array of quiz IDs
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Course', CourseSchema);