const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

// GET /api/courses
exports.getCourses = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const courses = await Course.find(filter);
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/courses/enrolled
exports.getEnrolledCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user.id }).populate(
      "courseId",
    );
    const courses = enrollments.map((e) => ({
      ...e.courseId._doc,
      progress: e.progress,
      completedModules: e.completedModules,
      enrolledAt: e.enrolledAt,
    }));
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/courses/:id
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }
    // Check if enrolled
    const enrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId: req.params.id,
    });
    res.json({
      success: true,
      course,
      enrollment: enrollment || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/courses
exports.createCourse = async (req, res) => {
  try {
    const { title, description, modules, videos, notes, quizzes } = req.body;
    const course = new Course({
      title,
      description,
      modules: modules || [],
      videos: videos || [],
      notes: notes || [],
      quizzes: quizzes || [],
    });
    await course.save();
    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/courses/:id
exports.deleteCourse = async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/courses/:id/enroll
exports.enrollCourse = async (req, res) => {
  try {
    const existing = await Enrollment.findOne({
      userId: req.user.id,
      courseId: req.params.id,
    });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Already enrolled" });
    }
    const enrollment = new Enrollment({
      userId: req.user.id,
      courseId: req.params.id,
    });
    await enrollment.save();

    // Update user skillPoints
    const User = require("../models/User");
    await User.findByIdAndUpdate(req.user.id, { $inc: { skillPoints: 5 } });

    res.status(201).json({ success: true, enrollment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/courses/:id/progress
exports.updateProgress = async (req, res) => {
  try {
    const { moduleTitle, totalModules } = req.body;
    const enrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId: req.params.id,
    });
    if (!enrollment) {
      return res.status(404).json({ success: false, message: "Not enrolled" });
    }
    if (!enrollment.completedModules.includes(moduleTitle)) {
      enrollment.completedModules.push(moduleTitle);
    }
    if (totalModules) {
      enrollment.progress = Math.round(
        (enrollment.completedModules.length / totalModules) * 100,
      );
    }
    await enrollment.save();
    res.json({ success: true, enrollment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
