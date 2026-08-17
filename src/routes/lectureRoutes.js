const express = require('express');
const router = express.Router();
const lectureController = require('../controllers/lectureController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', lectureController.getAllLectures);
router.get('/:id', lectureController.getLectureById);
router.post('/', authMiddleware, lectureController.createLecture);
router.delete('/:id', authMiddleware, lectureController.deleteLecture);

module.exports = router;
