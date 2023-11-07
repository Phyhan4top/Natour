
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const ApiFeatures = require("../utils/ApiFeatures");


exports. createReq = (Model) => {

return catchAsync(async (req, res, next) => {
  const doc = await Model.create(req.body);
  res.status(201).send({ status: 'success', body: { data: doc } });
});
}
exports. deleteReq = (Model) => {

return catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const model = await Model.findByIdAndDelete(id);
  if (!model) {
    return next(new AppError('No Document found with this ID', 404));
  }
  res.status(204).send({ status: 'success', data: { message: 'DELETED' } });
});
}

exports.updateReq = (Model) => {

return catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const body = req.body;
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
    data:model
    },
  });
});
}

exports.getOneReq=(Model,populateOptions)=>{
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id)
    if (populateOptions) {
    query.populate(populateOptions);
    }
    const model = await query
    if (!model) {
      return next(new AppError('No Document found with this ID', 404));
    }
    return res.status(200).json({
      status: 'success',
      requestAt: req.time,
      data: {
        data: model,
      },
    });
  });
  
}

exports.getAllReq = (Model) => {

  return catchAsync(async (req, res, next) => {
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

}