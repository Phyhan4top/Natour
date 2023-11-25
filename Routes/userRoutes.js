const express = require('express');
const {
  getAllUser,
  getUser,
  deleteUser,
  updateUser,
  filterBody,
  updateCurrentUser,
  getMe,
  uploadPhotoFile,
  photoResize,
} = require('../Controllers/userRoutesHandler');
const {
  SignUp,
  Login,
  forgotPassword,
  passwordReset,
  UpdatePassword,
  protect,
  restrictTo,
  logoutAuth,
} = require('../Model/Auth/AuthController');

const Router = express.Router();
Router.post('/signup', SignUp);
Router.post('/login', Login);
Router.get('/logout', logoutAuth);
Router.post('/forgotpassword', forgotPassword);
Router.patch('/resetpassword/:resetToken', passwordReset);

///Add protect middle ware to the below routes
Router.use(protect);

Router.patch('/updatepassword', UpdatePassword);
Router.patch('/updateMe', uploadPhotoFile, photoResize, updateCurrentUser);
Router.delete('/deleteMe', deleteUser);
Router.get('/me', getMe, getUser);

///Add retrsictTo middle ware to the below routes
Router.use(restrictTo('admin'));

Router.route('/').get(getAllUser);
Router.route('/:id')
  .get(getUser)
  .patch(filterBody, updateUser)
  .delete(deleteUser);

module.exports = Router;
