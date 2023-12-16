const multer = require('multer');

const sharp = require('sharp');
const Tour = require('../Model/tourModel');
const ApiFeatures = require('../utils/ApiFeatures');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const {
  deleteReq,
  createReq,
  updateReq,
  getOneReq,
  getAllReq,
} = require('./handlerFactory');

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) return cb(null, true);
  return cb(
    new AppError('File upload is not an image, please upload images only', 400),
    false,
  );
};
const upload = multer({ Storage: multerStorage, fileFilter: multerFilter });
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = async (req, res, next) => {
  req.body.imageCover = `tour-${req.params.id}-cover-jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    }),
  );

  next();
};
exports.aliasTop5Cheap = (req, res, next) => {
  req.query.limit = '5';
  req.query.page = '1';
  req.query.sort = '-ratingsAverage,price';
  req.query.field = 'name,ratingsAverage,price,summary,ddifficulty';
  next();
};
// '/tour-within/:distance/center/:latLng/unit/:unit'
exports.getTourWithin = async (req, res, next) => {
  const { distance, latLng, unit } = req.params;
  const [lat, lng] = latLng.split(',');
  const radius = unit === 'ml' ? distance / 3963.19 : distance / 6378.14;

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide lantitude and longitude,in format of [lat,lng]',
        400,
      ),
    );
  }

  console.log(req.params);
  console.log('latitude:', lat, 'longitude:', lng, 'radius:', radius);

  const tour = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  console.log(tour);
  res.status(200).json({
    status: 'success',
    result: tour.length,
    body: {
      data: tour,
    },
  });
};

exports.getLocation = async (req, res, next) => {
  const { latLng, unit } = req.params;
  const [lat, lng] = latLng.split(',');
  const unitMult = unit === 'ml' ? 1 / 1609.34 : 1 / 1000;
  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide lantitude and longitude,in format of [lat,lng]',
        400,
      ),
    );
  }
  const distance = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
        distanceField: 'distance',
        distanceMultiplier: unitMult,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    body: {
      data: distance,
    },
  });
};
///API FEATURES

//GET ALL REQUEST FUNC
exports.getAllTour = getAllReq(Tour);

//GET SINGLE REQUEST FUNC
exports.getTour = getOneReq(Tour, { path: 'reviews' });

//POST REQUEST FUNC
exports.createTour = createReq(Tour);

//PATCH REQUEST FUNC
exports.updateTour = updateReq(Tour);
//DELETE REQUEST FUNC
exports.deleteTour = deleteReq(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        sumRatings: { $sum: '$ratingsQuantity' },
        num: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    body: {
      data: stats,
    },
  });
});
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = Number(req.params.year);

  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: {
          $sum: 1,
        },
        tours: { $push: '$name' },
      },
    },
    { $addFields: { month: '$_id' } },
    { $project: { _id: 0 } },
    { $sort: { month: 1 } },
  ]);
  res.status(200).json({
    status: 'success',
    result: plan.length,
    body: {
      data: plan,
    },
  });
});
