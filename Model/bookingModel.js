const mongoose = require('mongoose');

const Schema = {
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must have a tour'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must have a user'],
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price'],
  },
  paid: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
};

const bookingSchema = mongoose.Schema(Schema);

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({ path: 'tour', select: 'name' });
  next();
});

const bookingModel = mongoose.model('Booking', bookingSchema);

module.exports = bookingModel;
