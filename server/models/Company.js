const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    profile: {
      type: String,
      default: null,
    },
    eligibility: {
      type: String,
      default: null,
    },
    jobRoles: {
      type: mongoose.Schema.Types.Mixed, // Array of roles
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Company', CompanySchema);