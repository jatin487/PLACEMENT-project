const mongoose = require('mongoose');

const StudentProfileSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
      unique: true,
    },

    userId: {
      type: String,
      required: true,
    },

    branch: {
      type: String,
      required: false,
    },

    semester: {
      type: Number,
      required: false,
    },

    cgpa: {
      type: Number,
      required: false,
    },

    skills: {
      type: [String],
      required: false,
    },

    resumeUrl: {
      type: String,
      required: false,
    },

    placementStatus: {
      type: String,
      enum: ['unplaced', 'placed', 'not_interested'],
      default: 'unplaced',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);