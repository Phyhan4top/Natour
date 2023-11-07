const AppError = require("../utils/AppError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`
  return new AppError(message,400)
}
const handleDuplicateErrorDB = (err) => {
  const message = `Duplicate field value: ${err.keyValue.name}, please use another value`
  return new AppError(message,400)
}
const handleValidationErrorDb = (err) => {
  const errors = Object.values(err.errors).map(el=>el.message).join('. ')

  let message=`Invalid input data: ${errors}`
 
    
    return new AppError(message, 404);
}
const handleJwtError = (err) => {
    return new AppError('Invalid token,please try again', 401);
}
const handleTokenExpiredError = (err) => {
  return new AppError('Token has expire,please login again', 401);
};
const showDevelopmentError = (err, res) => {
   res.status(err.statusCode).json({
     status: err.status,
     error: err,
     message: err.message,
     stack: err.stack,
   });
}
const showProductionError = (err, res) => {
 
  if (err.isOperational) {
      
       res.status(err.statusCode).json({
         status: err.status,
         message: err.message,
       });
  } else {

       console.error('Error', err);
       res.status(500).json({
         status: 'Error',
         message: 'Something went wrong',
       });
     }
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
    // console.log(err);
 
  if (process.env.NODE_ENV === 'development') {
    showDevelopmentError(err, res)
  } 
  else if (process.env.NODE_ENV === 'production') {

    let error = { ...err };
    if (err.name === 'CastError') {
      error = handleCastErrorDB(error);
    } else if (err.name === 'ValidationError') {
      error = handleValidationErrorDb(error);
    } else if (err.code === 11000) {
    error=handleDuplicateErrorDB(error)
    } else if (err.name === 'JsonWebTokenError') {
    error=handleJwtError(error)
    }
     else if (err.name === 'TokenExpiredError') {
       error = handleTokenExpiredError(error);
     }
    
    showProductionError(error, res); 
  }
  next();
};
