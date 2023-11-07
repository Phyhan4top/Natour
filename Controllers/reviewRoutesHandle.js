const Review = require('../Model/reviewModel');
const {
  deleteReq,
  createReq,
  getOneReq,
  getAllReq,
  updateReq,
} = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');

exports.getTourId = (req, res, next) => {
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) {
    req.body.user = req.user._id;
  }
  next();
};

exports.getAllReview = getAllReq(Review);
exports.getReview = getOneReq(Review);
exports.CreateReview = createReq(Review);
exports.deleteReview = deleteReq(Review);
exports.updateReview = updateReq(Review);
