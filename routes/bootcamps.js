const express = require('express');
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require('../controllers/bootcamps');

// advancedResults middleware
const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');

// include other resource routers
const courseRouter = require('./courses');

const router = express.Router();

// re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);

// photo upload route
router.route('/:id/photo').put(bootcampPhotoUpload);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

module.exports = router;
