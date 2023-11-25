const bookingModel = require('../Model/bookingModel');
const Tour = require('../Model/tourModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.Overview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    tours,
    title: 'Exciting tours for adventurous people',
  });
});

exports.tourView = catchAsync(async (req, res, next) => {
  const ident = req.params.name;
  const { id } = req.user;
  const tour = await Tour.find({ name: ident }).populate({
    path: 'reviews',
    fields: 'review user rating',
  });
  const Booked = await bookingModel.find({ tour: tour[0].id, user: id });

  const book = Booked.length > 0;

  if (!tour[0]) {
    return next(new AppError('there is no tour with this name', 404));
  }

  res.status(200).render('tour', { tour: tour[0], title: tour[0].name, book });
});

exports.loginView = catchAsync(async (req, res) => {
  res.status(200).render('login', { title: 'Log in to your account' });
});
exports.signUpView = catchAsync(async (req, res) => {
  res.status(200).render('signUp', { title: 'Sign  up now' });
});
exports.userView = catchAsync(async (req, res) => {
  const { user } = req;

  res.status(200).render('user', { title: 'Account Setting', user });
});

exports.myBookings = catchAsync(async (req, res) => {
  const Bookings = await bookingModel.find({ user: req.user.id });
  const toursId = Bookings.map((el) => el.tour);
  const myTours = await Tour.find({ _id: { $in: toursId } });

  res.status(200).render('overview', { tours: myTours, title: 'My Bookings' });
});
