const express = require('express');
const {
  getCheckoutSession,
  getAllBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  getCurrentUserBookings,
} = require('../Controllers/BookingController');
const { protect } = require('../Model/Auth/AuthController');

const Router = express.Router();
Router.route('/').get(getAllBookings).post(protect, createBooking);

Router.route('/:bookingId').patch(updateBooking).delete(deleteBooking);
Router.route('/me').get(protect, getCurrentUserBookings);
Router.route('/checkout-session/:tourId').get(protect, getCheckoutSession);

module.exports = Router;
