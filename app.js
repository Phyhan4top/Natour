/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
// eslint-disable-next-line node/no-unpublished-require
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp');
const cors = require('cors');

const App = express();
const cookieParser = require('cookie-parser');
const compression = require('compression');
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');
const reviewRouter = require('./Routes/reviewRoutes');
const BookingRouter = require('./Routes/bookingRoutes');
const AppError = require('./utils/AppError');
const viewRouter = require('./Routes/viewRoutes');
const errorController = require('./Controllers/ErrorController');
const { webhookCheckout } = require('./Controllers/BookingController');

//GLOBAL MIDDLE-WARE

App.set('view engine', 'pug');
App.set('views', path.join(__dirname, 'views'));
// TO READ STATIC FILES
App.use(express.static('./public'));

//SET HTTP HEADERS SECURITY MIDDLE-WARE
App.use(
  helmet({
    // contentSecurityPolicy: {
    //   directives: {
    //     defaultSrc: ["'self'"],
    //     scriptSrc: ["'self'", 'trusted-cdn.com'],
    //     styleSrc: ["'self'", 'styles.example.com'],
    //   },
    // },
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: { requireCorp: false },
    // crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

// App.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
//DEVELOPMENT LOGGING

if (process.env.NODE_ENV === 'development') {
  App.use(morgan('dev'));
}

//LIMIT REQUEST FROM SAME IP

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later.',
  keyGenerator: (req) => req.headers['x-forwarded-for'] || req.ip,
});
if (process.env.NODE_ENV === 'development') {
  // Disable or adjust rate limiting for development
} else {
  App.use('/api', limiter);
}
//STRIPE WEBHOOK
App.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  webhookCheckout,
);
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
//Implementing CORS
const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your frontend URL
  credentials: true, // Allow credentials (cookies, etc.)
};
App.use(cors(corsOptions));
App.options('*', cors(corsOptions));
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
