const { Lecture } = require('../models');

// GET all lectures with optional search & subject filter
exports.getAllLectures = async (req, res) => {
  try {
    const { subject, search } = req.query;
    const whereClause = {};

    if (subject && subject !== 'All') {
      whereClause.subject = subject;
    }

    const lectures = await Lecture.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    let results = lectures.map(l => l.toJSON());
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(l =>
        l.title.toLowerCase().includes(q) ||
        (l.description && l.description.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET lecture by ID
exports.getLectureById = async (req, res) => {
  try {
    const lecture = await Lecture.findByPk(req.params.id);
    if (!lecture) {
      return res.status(404).json({ success: false, message: 'Lecture not found' });
    }
    res.json({ success: true, data: lecture });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// CREATE a new lecture
exports.createLecture = async (req, res) => {
  try {
    const { id, title, subject, faculty, date, duration, videoUrl, thumbnail, description, tags } = req.body;
    const newLecture = await Lecture.create({
      id: id || `lec-${Date.now()}`,
      title,
      subject: subject || 'General',
      faculty: faculty || req.user?.name || 'Faculty',
      date: date || new Date().toISOString().split('T')[0],
      duration: duration || '45 mins',
      videoUrl: videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516116211223-4c59970a9310?auto=format&fit=crop&w=600&q=80',
      description: description || '',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : ['Lecture']),
    });

    res.status(201).json({ success: true, message: 'Lecture added successfully', data: newLecture });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE a lecture
exports.deleteLecture = async (req, res) => {
  try {
    const deleted = await Lecture.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Lecture not found' });
    }
    res.json({ success: true, message: 'Lecture deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
