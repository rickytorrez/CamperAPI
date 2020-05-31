const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please provide a title for the review'],
        maxLength: 100
    },
    text: {
        type: String,
        required: [true, 'Please add some text']
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Please add a rating between 1 and 10']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
});

// prevent user from submitting more than one review per bootcamp
ReviewSchema.index({ bootcampt: 1, user: 1 }, { unique: true });

// static method to get average rating and save
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
    const obj = await this.aggregate([
        {
            // match the field with the bootcamp that is passed in as a param
            $match: { bootcamp: bootcampId },
        },
        {
            // the calculated object we want to create
            // takes a reference id and the field we want to average => rating
            $group: {
                _id: '$bootcamp',
                averageRating: { $avg: '$rating' },
            },
        },
    ]);
    // save the field into the database
    try {
        // grabbing the boocam model, updating the specific bootcamp by Id and adding the average cost
        // ending as 0 when all the reviews are deleted
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageRating: obj.length > 0 ? obj[0].averageRating : 0
        });
    } catch (err) {
        console.error(err);
    }
};

// Call getAverageRating after save
ReviewSchema.post('save', async function () {
    await this.constructor.getAverageRating(this.bootcamp);
});

// Call getAverageRating before remove
ReviewSchema.post('remove', async function () {
    await this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model('Review', ReviewSchema);