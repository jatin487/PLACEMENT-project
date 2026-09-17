const mongoose = require("mongoose");

const StudentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
      enum: ["unplaced", "placed", "not_interested"],
      default: "unplaced",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("StudentProfile", StudentProfileSchema);
