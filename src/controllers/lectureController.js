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

// UPLOAD video / thumbnail file
exports.uploadFile = async (req, res) => {
  try {
    let videoUrl = null;
    let thumbnailUrl = null;

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    if (req.files) {
      if (req.files.video && req.files.video.length > 0) {
        const videoFile = req.files.video[0];
        videoUrl = `${baseUrl}/uploads/videos/${videoFile.filename}`;
      }
      if (req.files.thumbnail && req.files.thumbnail.length > 0) {
        const thumbFile = req.files.thumbnail[0];
        thumbnailUrl = `${baseUrl}/uploads/thumbnails/${thumbFile.filename}`;
      }
    } else if (req.file) {
      if (req.file.mimetype.startsWith('video/')) {
        videoUrl = `${baseUrl}/uploads/videos/${req.file.filename}`;
      } else {
        thumbnailUrl = `${baseUrl}/uploads/thumbnails/${req.file.filename}`;
      }
    }

    if (!videoUrl && !thumbnailUrl) {
      return res.status(400).json({ success: false, message: 'No valid file uploaded' });
    }

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        videoUrl,
        thumbnailUrl,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// CREATE a new lecture
exports.createLecture = async (req, res) => {
  try {
    let { id, title, subject, faculty, date, duration, videoUrl, thumbnail, description, tags } = req.body;

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // If files are attached in multipart form directly
    if (req.files) {
      if (req.files.video && req.files.video.length > 0) {
        videoUrl = `${baseUrl}/uploads/videos/${req.files.video[0].filename}`;
      }
      if (req.files.thumbnail && req.files.thumbnail.length > 0) {
        thumbnail = `${baseUrl}/uploads/thumbnails/${req.files.thumbnail[0].filename}`;
      }
    }

    // Default thumbnails based on subject if none provided
    const defaultThumbs = {
      'DSA': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
      'DAA': 'https://images.unsplash.com/photo-1516116211223-4c59970a9310?auto=format&fit=crop&w=600&q=80',
      'DBMS': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80',
      'System Design': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
      'Placement Prep': 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
    };

    const finalThumbnail = thumbnail || defaultThumbs[subject] || 'https://images.unsplash.com/photo-1516116211223-4c59970a9310?auto=format&fit=crop&w=600&q=80';

    let parsedTags = ['Lecture'];
    if (Array.isArray(tags)) {
      parsedTags = tags;
    } else if (typeof tags === 'string') {
      try {
        const jsonParsed = JSON.parse(tags);
        parsedTags = Array.isArray(jsonParsed) ? jsonParsed : [tags];
      } catch (e) {
        parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
      }
    }

    const newLecture = await Lecture.create({
      id: id || `lec-${Date.now()}`,
      title: title || 'Untitled Lecture',
      subject: subject || 'General',
      faculty: faculty || req.user?.name || 'Faculty Member',
      date: date || new Date().toISOString().split('T')[0],
      duration: duration || '45 mins',
      videoUrl: videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnail: finalThumbnail,
      description: description || '',
      tags: parsedTags.length > 0 ? parsedTags : ['Lecture'],
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
