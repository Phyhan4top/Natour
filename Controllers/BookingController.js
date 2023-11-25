/* eslint-disable import/no-extraneous-dependencies */
const stripe = require('stripe')(process.env.Stripe_Secret_Key);

const bookingModel = require('../Model/bookingModel');
const Tour = require('../Model/tourModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //get Booked Tour
  const { tourId } = req.params;
  const tour = await Tour.findById(tourId);
  //CREATE CHECKOUT SESSION

  const product = await stripe.products.create({
    name: `${tour.name} tour`,
    description: tour.summary,
    images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: tour.price * 100,
    currency: 'usd',
  });

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    mode: 'payment',
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${tourId}&user=${
      req.user.id
    }&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.name}`,
  });

  res.status(200).json({ status: 'success', session });
});

exports.checkoutBooking = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) {
    return next();
  }
  await bookingModel.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});
exports.createBooking = catchAsync(async (req, res, next) => {
  const { tour } = req.body;
  const touR = await Tour.find({ _id: tour });

  if (!touR) return next(new AppError('there is no tour with this ID', 404));
  const booked = await bookingModel.find({
    tour: touR[0].id,
    user: req.user.id,
  });

  if (booked[0]) return next(new AppError("You can't book a tour twice", 403));

  const body = {
    tour: touR[0].id,
    user: req.user.id,
    price: touR[0].price,
  };
  const Booking = await bookingModel.create(body);

  res.status(201).json({
    status: 'success',
    data: {
      Booking,
    },
  });
});
exports.updateBooking = catchAsync(async (req, res, next) => {
  const { bookingId } = req.params;
  const { tourId } = req.body;

  const tour = await Tour.find({ _id: tourId });
  if (!tour) return next(new AppError('there is no tour with this ID', 404));
  const Booking = await bookingModel.findByIdAndUpdate(bookingId, {
    tour: tour[0].id,
  });

  res.status(200).json({
    status: 'success',
    data: {
      Booking,
    },
  });
});
exports.getAllBookings = catchAsync(async (req, res, next) => {
  const Bookings = await bookingModel.find();
  res.status(200).json({
    status: 'success',
    results: Bookings.length,
    data: {
      Bookings,
    },
  });
});
exports.getCurrentUserBookings = catchAsync(async (req, res, next) => {
  const Bookings = await bookingModel.find({ user: req.user.id });
  res.status(200).json({
    status: 'success',
    results: Bookings.length,
    data: {
      Bookings,
    },
  });
});
exports.deleteBooking = catchAsync(async (req, res, next) => {
  const { bookingId } = req.params;
  const Bookings = await bookingModel.findByIdAndDelete(bookingId);
  res.status(204).json({
    status: 'success',
    data: {
      Bookings,
    },
  });
});
