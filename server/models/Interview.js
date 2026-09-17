const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    round: {
      type: Number,
      required: true,
    },
    feedback: {
      type: String,
      default: null,
    },
    result: {
      type: String,
      enum: ["pending", "passed", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Interview", interviewSchema);
