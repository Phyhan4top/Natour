
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const  helmet = require('helmet');
const  mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const App = express();
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');
const reviewRouter = require('./Routes/reviewRoutes');
const appError = require('./utils/AppError');
const errorController = require('./Controllers/ErrorController');

//GLOBAL MIDDLE-WARE

App.set('view engine', 'pug');
App.set('views', path.join(__dirname,'views'));
// TO READ STATIC FILES
App.use(express.static('./public'));

//SET HTTP HEADERS SECURITY MIDDLE-WARE
App.use(helmet())

//DEVELOPMENT LOGGING

if (process.env.NODE_ENV === 'development') {
  App.use(morgan('dev'));
}

//LIMIT REQUEST FROM SAME IP

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:'Too many request with this IP Address, try again later in the next 1hour'
})
App.use('/api', limiter)

// Error handling middleware
App.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

//BODY PASSER, READING DATA FROM BODY INTO REQ.BODY

App.use(express.json({limit:'10kb'}));

//DATA SANITAZATION AGAINST NOSQL QUERY INJECTION

App.use(mongoSanitize())
//DATA SANITAZATION AGAINST CROSS SITE SCRIPTTING(XSS)
App.use(xss());

//DATA SANITAZATION AGAINST HPP(HTTP PARAMETERS POLLUTION)
App.use(hpp({ whitelist: ['duration', 'price', 'maxGroupSize', 'ratingAverage', 'ratingsQuantity', 'difficulty'] }))

//TESTING MIDDLE WARE
const middleWare = (req, res, next) => {
  req.time = new Date().toDateString();
  console.log('Hello from the server');
;
  next();
};
App.use(middleWare)
//Pug MiddleWare
App.get('/', (req, res) => {
res.status(200).render('basic')
})

App.get('/overview', (req, res) => {
res.status(200).render('overview',{tour:'All Tours'})
})

App.get('/tour', (req, res) => {
res.status(200).render('tour',{tour:'The Forest Hiker'})
})


App.use('/api/v1/tours', tourRouter);
App.use('/api/v1/users', userRouter);
App.use('/api/v1/reviews', reviewRouter);

App.all('*',(req,res,next)=>{
  // const err = new Error(`can't find the ${req.originalUrl}`)
  // err.statusCode = 404;
  // err.status='fail'
  
  next(new appError(`can't find the ${req.originalUrl}`,404));
})

//GLOBAL ERROR MIDDLE-WARE HANDLER
App.use(errorController)

module.exports=App