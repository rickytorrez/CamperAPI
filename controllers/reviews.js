const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review');
const User = require('../models/User');
const Bootcamp = require('../models/Bootcamp');

// @desc    Get reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/bootcamps/:bootcampId/reviews => help of advanced results middleware
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {

    // review for specific bootcamp 
    if (req.params.bootcampId) {
        const reviews = await Review.find({ bootcamp: req.params.bootcampId });

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews,
        });

        // all reviews
    } else {
        res.status(200).json(res.advancedResults);
    }
});

// @desc    Get single review
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = asyncHandler(async (req, res, next) => {

    // find the review, populated with the bootcamp it belongs to
    const review = await Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!review) {
        return next(new ErrorResponse(`No review found with the id of ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        data: review
    })
});

// @desc    Add review
// @route   POST /api/v1/bootcamps/:bootcampId/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res, next) => {
    // get the id for bootcamp
    req.body.bootcamp = req.params.bootcampId;

    // get the id for user
    req.body.user = req.user.id;

    // find the bootcamp by id
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    // check for bootcamp
    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId} was found.`, 404))
    }

    const review = await Review.create(req.body);

    res.status(201).json({
        success: true,
        data: review
    })
});

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {

    // find the review by id
    let review = await Review.findById(req.params.id);

    // check for review
    if (!review) {
        return next(new ErrorResponse(`No review with the id of ${req.params.id} was found.`, 404))
    }

    // check for review owner or admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Not auhtorized to update review.`, 401))
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    // saves and recalculates the avg rating
    await review.save();

    res.status(200).json({
        success: true,
        data: review
    })
});

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {

    // find the review by id
    const review = await Review.findById(req.params.id);

    // check for review
    if (!review) {
        return next(new ErrorResponse(`No review with the id of ${req.params.id} was found.`, 404))
    }

    // check for review owner or admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Not auhtorized to update review.`, 401))
    }

    await review.remove()

    res.status(200).json({
        success: true,
        data: {}
    })
});