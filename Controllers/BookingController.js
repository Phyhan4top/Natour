/* eslint-disable import/no-extraneous-dependencies */
const stripe = require('stripe')(process.env.Stripe_Secret_Key);

const bookingModel = require('../Model/bookingModel');
const Tour = require('../Model/tourModel');
const userModel = require('../Model/userModel');
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
    images: [
      `https://natour-app-ae8a.onrender.com/img/tours/${tour.imageCover}`,
    ],
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
    success_url: `${req.protocol}://${req.get('host')}/my-bookings`,
    cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.name}`,
    client_reference_id: tour.id,
    customer_email: req.user.email,
  });

  res.status(200).json({ status: 'success', session });
});

// exports.checkoutBooking = catchAsync(async (req, res, next) => {
//   const { tour, user, price } = req.query;
//   if (!tour && !user && !price) {
//     return next();
//   }
//   await bookingModel.create({ tour, user, price });

//   res.redirect(req.originalUrl.split('?')[0]);
// });

const createBookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = await userModel.findOne({ email: session.customer_email });
  const price = session.amount_total / 100;
  await bookingModel.create({ tour, user, price });
};
exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object);

  res.status(200).json({ received: true, data: event.data });
};
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
    body: {
      data: Booking,
    },
  });
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
    body: {
      data: Booking,
    },
  });
});
exports.getAllBookings = catchAsync(async (req, res, next) => {
  const Bookings = await bookingModel.find();
  res.status(200).json({
    status: 'success',
    results: Bookings.length,
    body: {
      data: Bookings,
    },
  });
});
exports.getCurrentUserBookings = catchAsync(async (req, res, next) => {
  const Bookings = await bookingModel.find({ user: req.user.id });
  res.status(200).json({
    status: 'success',
    results: Bookings.length,
    body: {
      data: Bookings,
    },
  });
});
exports.deleteBooking = catchAsync(async (req, res, next) => {
  const { bookingId } = req.params;
 await bookingModel.findByIdAndDelete(bookingId);
  res.status(204).json({
    status: 'success',
  });
});
