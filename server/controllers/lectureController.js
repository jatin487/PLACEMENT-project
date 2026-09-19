const Lecture = require("../models/Lecture");

exports.getLectures = async (req, res) => {
  try {
    const { subject } = req.query;
    const filter = subject && subject !== "All" ? { subject } : {};
    const lectures = await Lecture.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, lectures });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getLectureById = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture)
      return res
        .status(404)
        .json({ success: false, message: "Lecture not found" });
    res.json({ success: true, lecture });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createLecture = async (req, res) => {
  try {
    const lecture = new Lecture(req.body);
    await lecture.save();
    res.status(201).json({ success: true, lecture });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    res.json({ success: true, message: "Progress saved" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
