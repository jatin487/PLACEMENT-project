const StudentProfile = require('../models/StudentProfile');

// @desc    Get logged in student's profile (creates empty if not exists)
// @route   GET /api/student-profile/me
// @access  Private
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    let profile = await StudentProfile.findOne({ userId }).populate('userId', 'name email role department batch');

    if (!profile) {
      profile = await StudentProfile.create({ userId });
      profile = await StudentProfile.findById(profile._id).populate('userId', 'name email role department batch');
    }

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student profile',
      error: error.message
    });
  }
};

// @desc    Update logged in student's profile
// @route   PUT /api/student-profile/me or PATCH /api/student-profile/me
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { branch, semester, cgpa, skills, resumeUrl, placementStatus } = req.body;

    const updateFields = {};
    if (branch !== undefined) updateFields.branch = branch;
    if (semester !== undefined) updateFields.semester = semester;
    if (cgpa !== undefined) updateFields.cgpa = cgpa;
    if (skills !== undefined) updateFields.skills = skills;
    if (resumeUrl !== undefined) updateFields.resumeUrl = resumeUrl;
    if (placementStatus !== undefined) updateFields.placementStatus = placementStatus;

    const profile = await StudentProfile.findOneAndUpdate(
      { userId },
      { $set: updateFields },
      { new: true, upsert: true, runValidators: true }
    ).populate('userId', 'name email role department batch');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update student profile',
      error: error.message
    });
  }
};

// @desc    Get public profile of any student by userId
// @route   GET /api/student-profile/user/:userId or GET /api/student-profile/:userId
// @access  Private
exports.getProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await StudentProfile.findOne({ userId }).populate('userId', 'name email role department batch');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public profile',
      error: error.message
    });
  }
};
