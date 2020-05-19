const express = require('express');
const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses');

const router = express.Router({ mergeParams: true });

// {{ URL }}/:bootcampID/courses => route for endpoints that require a bootcampId \\
router.route('/').get(getCourses).post(addCourse);

router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse);

module.exports = router;
