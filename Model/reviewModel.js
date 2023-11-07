const mongoose = require('mongoose');
const Tour = require('./tourModel');

const Schema = {
  review: {
    type: String,
    required: [true, 'Review must not be empty'],
  },
  rating: {
    type: Number,
    minlength: 1,
    maxlength: 5,
    default: 4.5,
  },
  tour: {
    type: mongoose.ObjectId,
    ref: 'Tour',
    required: [true, 'Review must hava a tour'],
  },
  user: {
    type: mongoose.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
};

const reviewSchema = mongoose.Schema(Schema, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});
reviewSchema.index({tour:1,user: 1},{unique:true})
reviewSchema.pre(/^find/, async function (next) {
  this.populate({ path: 'user', select: 'name photo' });
  next();
});

reviewSchema.statics.createRatingAvg = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  console.log(stats);


 await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0].avgRating,
    ratingsQuantity: stats[0].nRating,
  });
};

reviewSchema.post('save', function() {
 this.constructor.createRatingAvg(this.tour);
});


reviewSchema.pre(/^findOneAnd/, async function (next) {
  // console.log('Before findOne', this._conditions);
this.r =  this.findOne()

  // console.log('After findOne', this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {

  console.log('Before createRatingAvg', this.r);
  await this.r.createRatingAvg(this.r.tour);
  console.log('After createRatingAvg', this.r);
});

const reviewModel = mongoose.model('Review', reviewSchema);

module.exports = reviewModel;
