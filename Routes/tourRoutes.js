const express = require('express');
const {
  getAllTour,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTop5Cheap,
  getTourStats,
  getMonthlyPlan,
  getTourWithin,
  getLocation,
  uploadTourImages,
  resizeTourImages,
} = require('../Controllers/tourRoutesHandler');
const { protect, restrictTo } = require('../Model/Auth/AuthController');

const reviewRouter = require('./reviewRoutes');

const Router = express.Router();
Router.use('/:tourId/review', reviewRouter);
// Router.param('id', checkId)
Router.route('/tours-within/:distance/center/:latLng/unit/:unit').get(
  getTourWithin,
);
Router.route('/distance/:latLng/unit/:unit').get(getLocation);
Router.route('/')
  .get(getAllTour)
  .post(protect, restrictTo('admin'), createTour);
Router.route('/top-5-cheap').get(aliasTop5Cheap, getAllTour);
Router.route('/tours-stats').get(getTourStats);
Router.route('/monthly-plan/:year').get(
  protect,
  restrictTo('admin', 'lead-guide', 'guide'),
  getMonthlyPlan,
);
Router.route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    // uploadTourImages,
    // resizeTourImages,
    updateTour,
  )
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = Router;
