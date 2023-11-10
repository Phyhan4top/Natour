const Tour = require('../Model/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.Overview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    tours,
    title: 'Exciting tours for adventurous people',
  });
});

exports.tourView = catchAsync(async (req, res) => {
 
  const ident = req.params.name

  const tour = await Tour.find({ name: ident }).populate({path:'reviews',fields:'review user rating'});
  res.status(200).render('tour', { tour: tour[0], title: tour[0].name });
});
