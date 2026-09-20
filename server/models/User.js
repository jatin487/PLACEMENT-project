const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "faculty", "admin", "recruiter"],
      default: "student",
    },
    department: { type: String, default: null },
    batch: { type: String, default: null },
    streak: { type: Number, default: 0 },
    skillPoints: { type: Number, default: 0 },
    lastActive: { type: String, default: null },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);