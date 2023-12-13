const express = require('express');

const Router = express.Router();
const {
  Overview,
  tourView,
  loginView,
  userView,
  myBookings,
  signUpView,
} = require('../Controllers/viewsRoutesHandle');
const { isLoggedIn, protect } = require('../Model/Auth/AuthController');

// Router.use(isLoggedIn);
Router.route('/').get(isLoggedIn, Overview);
Router.route('/tour/:name').get(isLoggedIn, tourView);
Router.route('/login').get(isLoggedIn, loginView);
Router.route('/signup').get(signUpView);
Router.route('/user').get(protect, userView);
Router.route('/my-bookings').get(isLoggedIn, myBookings);

module.exports = Router;
