/* eslint-disable no-else-return */
const AppError = require('../utils/AppError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateErrorDB = (err) => {
  const message = `Duplicate field value: ${err.keyValue.name}, please use another value`;
  return new AppError(message, 400);
};
const handleValidationErrorDb = (err) => {
  const errors = Object.values(err.errors)
    .map((el) => el.message)
    .join('. ');

  const message = `Invalid input data: ${errors}`;

  return new AppError(message, 404);
};
const handleJwtError = () =>
  new AppError('Invalid token,please login and try again', 401);
const handleTokenExpiredError = () =>
  new AppError('Token has expire,please login again', 401);
const showDevelopmentError = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      message: err.message,
    });
  }
};
const showProductionError = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      console.error('Error', err);
   return   res.status(500).json({
        status: 'Error',
        message: 'Something went wrong',
      });
    }
  } else {
    if (err.isOperational) {
    return  res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        message: err.message,
      });
    }
 console.error('Error', err);
   return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      message: 'Something went wrong, please try again later',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    showDevelopmentError(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    let error = { ...err };
    error.message = err.message;
    if (err.name === 'CastError') {
      error = handleCastErrorDB(error);
    } else if (err.name === 'ValidationError') {
      error = handleValidationErrorDb(error);
    } else if (err.code === 11000) {
      error = handleDuplicateErrorDB(error);
    } else if (err.name === 'JsonWebTokenError') {
      error = handleJwtError(error);
    } else if (err.name === 'TokenExpiredError') {
      error = handleTokenExpiredError(error);
    }

    showProductionError(error, req, res);
  }
  next();
};
