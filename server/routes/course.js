const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getCourses,
  getCourseById,
  createCourse,
  enrollCourse,
  getEnrolledCourses,
  updateProgress,
} = require("../controllers/courseController");

router.get("/enrolled", auth, getEnrolledCourses);
router.get("/", auth, getCourses);
router.get("/:id", auth, getCourseById);
router.post("/", auth, createCourse);
router.post("/:id/enroll", auth, enrollCourse);
router.put("/:id/progress", auth, updateProgress);

module.exports = router;
