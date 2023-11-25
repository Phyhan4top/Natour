/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
// eslint-disable-next-line node/no-unpublished-require
const xss = require('xss-clean');
const hpp = require('hpp');

const App = express();
const cookieParser = require('cookie-parser');
const compression = require('compression');
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');
const reviewRouter = require('./Routes/reviewRoutes');
const BookingRouter = require('./Routes/bookingRoutes');
const AppError = require('./utils/AppError');
const errorController = require('./Controllers/ErrorController');
const viewRouter = require('./Routes/viewRoutes');

//GLOBAL MIDDLE-WARE

App.set('view engine', 'pug');
App.set('views', path.join(__dirname, 'views'));
// TO READ STATIC FILES
App.use(express.static('./public'));

//SET HTTP HEADERS SECURITY MIDDLE-WARE
App.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

//DEVELOPMENT LOGGING

if (process.env.NODE_ENV === 'development') {
  App.use(morgan('dev'));
}

//LIMIT REQUEST FROM SAME IP

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    'Too many request with this IP Address, try again later in the next 1hour',
});
App.use('/api', limiter);

// Error handling middleware
App.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

//BODY PASSER, READING DATA FROM BODY INTO REQ.BODY

App.use(express.json({ limit: '10kb' }));

//COOKIE PARSER
App.use(cookieParser());

//DATA SANITAZATION AGAINST NOSQL QUERY INJECTION

App.use(mongoSanitize());
//DATA SANITAZATION AGAINST CROSS SITE SCRIPTTING(XSS)
App.use(xss());

//DATA SANITAZATION AGAINST HPP(HTTP PARAMETERS POLLUTION)
App.use(
  hpp({
    whitelist: [
      'duration',
      'price',
      'maxGroupSize',
      'ratingAverage',
      'ratingsQuantity',
      'difficulty',
    ],
  }),
);

App.use(compression());
//TESTING MIDDLE WARE
const middleWare = (req, res, next) => {
  req.time = new Date().toDateString();

  next();
};
App.use(middleWare);
//Pug MiddleWare

App.use('/', viewRouter);
App.use('/api/v1/tours', tourRouter);
App.use('/api/v1/users', userRouter);
App.use('/api/v1/reviews', reviewRouter);
App.use('/api/v1/bookings', BookingRouter);

App.all('*', (req, res, next) => {
  // const err = new Error(`can't find the ${req.originalUrl}`)
  // err.statusCode = 404;
  // err.status='fail'

  next(new AppError(`can't find the ${req.originalUrl}`, 404));
});

//GLOBAL ERROR MIDDLE-WARE HANDLER
App.use(errorController);

module.exports = App;
