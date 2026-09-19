const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getLectures,
  getLectureById,
  createLecture,
  updateProgress,
} = require("../controllers/lectureController");

router.get("/", auth, getLectures);
router.get("/:id", auth, getLectureById);
router.post("/", auth, createLecture);
router.put("/:id/progress", auth, updateProgress);

module.exports = router;
