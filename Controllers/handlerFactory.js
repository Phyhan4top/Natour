const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const ApiFeatures = require('../utils/ApiFeatures');

exports.createReq = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).send({ status: 'success', body: { data: doc } });
  });
exports.deleteReq = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const model = await Model.findByIdAndDelete(id);
    if (!model) {
      return next(new AppError('No Document found with this ID', 404));
    }
    res.status(204).send({ status: 'success', body: { message: 'DELETED' } });
  });

exports.updateReq = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { body } = req;
    const model = await Model.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!model) {
      return next(new AppError('No Document found with this ID', 404));
    }
    res.status(200).json({
      status: 'success',
      body: {
        data: model,
      },
    });
  });

exports.getOneReq = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    const query = Model.findById(req.params.id);
    if (populateOptions) {
      query.populate(populateOptions);
    }
    const model = await query;
    if (!model) {
      return next(new AppError('No Document found with this ID', 404));
    }
    return res.status(200).json({
      status: 'success',
      requestAt: req.time,
     body: {
        data: model,
      },
    });
  });

exports.getAllReq = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
    }

    const Features = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitField()
      .pagination();
    // const models = await Features.query.explain();
    const models = await Features.query;

    res.status(200).json({
      status: 'success',
      result: models.length,
      body: { data: models },
    });
  });
