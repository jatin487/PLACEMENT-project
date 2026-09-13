const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['badge', 'streak', 'certificate'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // E.g., certificate URL, streak count
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Achievement', AchievementSchema);