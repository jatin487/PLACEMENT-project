const { Course } = require('../models');

// GET all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      order: [['createdAt', 'ASC']]
    });
    res.json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// CREATE course
exports.createCourse = async (req, res) => {
  try {
    const { title, description, modules, videos, notes, quizzes } = req.body;
    const course = await Course.create({
      title,
      description,
      modules: modules || [],
      videos: videos || [],
      notes: notes || [],
      quizzes: quizzes || [],
    });
    res.status(201).json({ success: true, message: 'Course created successfully', data: course });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// UPDATE course
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    await course.update(req.body);
    res.json({ success: true, message: 'Course updated successfully', data: course });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE course
exports.deleteCourse = async (req, res) => {
  try {
    const deleted = await Course.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
