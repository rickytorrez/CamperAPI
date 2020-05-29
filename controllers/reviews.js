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