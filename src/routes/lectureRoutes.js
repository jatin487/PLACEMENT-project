const express = require('express');
const router = express.Router();
const lectureController = require('../controllers/lectureController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Optional auth helper so public/demo mode also functions smoothly
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    return authMiddleware(req, res, next);
  }
  next();
};

router.get('/', lectureController.getAllLectures);
router.get('/:id', lectureController.getLectureById);

// Direct file upload endpoint (video + thumbnail)
router.post(
  '/upload',
  optionalAuth,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  lectureController.uploadFile
);

// Create lecture with optional attached files or JSON
router.post(
  '/',
  optionalAuth,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  lectureController.createLecture
);

router.delete('/:id', optionalAuth, lectureController.deleteLecture);

module.exports = router;
