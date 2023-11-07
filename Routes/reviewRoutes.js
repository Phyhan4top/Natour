const express = require("express")
const { getAllReview, CreateReview, deleteReview ,getTourId, getReview, updateReview} = require("../Controllers/reviewRoutesHandle")
const {protect,restrictTo}=require('../Model/Auth/AuthController')
const Router = express.Router({ mergeParams: true })
//Protect All the routes
Router.use(protect)

Router.route('/').get(getAllReview).post(restrictTo('user'),getTourId,CreateReview)
Router.route('/:id')
  .get(getReview)
  .patch(restrictTo('user', 'admin'),updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview);

module.exports=Router