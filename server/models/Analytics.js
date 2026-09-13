const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    progress: {
      type: Number, // e.g., percentage completion of courses
      default: 0,
    },
    learningGraph: {
      type: mongoose.Schema.Types.Mixed, // Activity timeline
      default: null,
    },
    placementReadiness: {
      type: Number, // Score out of 100 based on various metrics
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Analytics', AnalyticsSchema);